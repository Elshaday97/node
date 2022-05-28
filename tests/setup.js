// Common set up used for every test
jest.setTimeout(30000); //Wait 30 seconds before ending any test

require("../models/User");
const keys = require("../config/keys");
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, {
  useMongoClient: true,
});
