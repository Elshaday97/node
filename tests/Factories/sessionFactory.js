const Buffer = require("safe-buffer").Buffer;
const keys = require("../../config/keys");
const Keygrip = require("keygrip");
const keygrip = new Keygrip([keys.cookieKey]); // Cookie sig

module.exports = (user) => {
  const sessionObject = {
    passport: {
      user: user._id.toString(),
    },
  };
  // Cookie session needs a base64 string
  const session = Buffer.from(JSON.stringify(sessionObject)).toString("base64");

  // Sign our cookie string using keygrip
  const sig = keygrip.sign("session=" + session);

  return { session, sig };
};
