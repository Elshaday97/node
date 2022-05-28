const { clearHash } = require("../services/cache");

module.exports = async (req, res, next) => {
  await next(); // Let the route handler run before the middle ware
  clearHash(req.user.id);
};
