const redis = require("redis");
const mongoose = require("mongoose");
const util = require("util"); // util promisify takes a function and makes it return a promise
const keys = require("../config/keys");
const exec = mongoose.Query.prototype.exec; // Reference to the original / untouched exec function inside mongoose

const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);

// Toggle caching on for queries that call the cache function only.
mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true; // The current query will use cache
  this.hashKey = JSON.stringify(options.key || "");
  return this; //return the query so this function becomes chainable
};

// Overriding the default exec function inside mongoose

//Not an arrow function because we want 'this' Reference the query currently being executed
mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    // Skip all caching
    return exec.apply(this, arguments);
  }

  // this.getQuery();  // get the current query
  // this.mongooseCollection.name // We must use the collection name of the current query to insure that it is truly unique

  // Extra step to create a copy of getQuery() onto a new object, so we don't modify it, and adding a collection key
  const nestedKey = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );

  // See if we have a value for hashKey in redis,
  const cacheValue = await client.hget(this.hashKey, nestedKey);
  // If we do, return that
  if (cacheValue) {
    const doc = JSON.parse(cacheValue); // string to JSON
    // turn the JSON object to a mongo document so our app knows how to use it
    const formattedDoc = Array.isArray(doc)
      ? doc.map((d) => new this.model(d)) // For array of objects like [{_id: '456', name: 'world'}, {_id: '789', name: '!!'}]
      : new this.model(doc); // For single objects like {_id: '123', name: 'hello'}
    return formattedDoc;
  }

  // If not, issue the query and store the result in redis
  const result = await exec.apply(this, arguments); // Calls the original exec function and send the request to MongoDB

  // turn result into JSON and store it to redis
  client.hset(this.hashKey, nestedKey, JSON.stringify(result));

  // return result to client
  return result; // result is a mongo document
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey)); // flush the redis cache by key
  },
};
