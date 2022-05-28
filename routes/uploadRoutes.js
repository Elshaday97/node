const AWS = require("aws-sdk");
const keys = require("../config/keys");
const uuid = require("uuid/v1");
const requireLogin = require("../middlewares/requireLogin");

const s3 = new AWS.S3({
  accessKeyId: keys.accessKeyId,
  secretAccessKey: keys.secretAccessKey,
});

module.exports = (app) => {
  app.get("api/upload", requireLogin, (req, res) => {
    const { user } = req;
    // Unique img name
    const key = `${user.id}/${uuid()}.jpeg`; // bypass s3's flat file system and create a "folder" for the user
    // create a url for the specific img to be uploaded, and send it back to the client
    s3.getSignedUrl(
      "putObject",
      {
        Bucket: "my-blog-bucket", // name of the bucket
        ContentType: "image/jpeg",
        Key: key,
      },
      (err, signedUrl) => {
        res.send({ key, signedUrl });
      }
    );
  });
};
