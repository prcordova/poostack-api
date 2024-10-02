const multer = require("multer");
const path = require("path");

const uploadMiddleware = multer({
  dest: path.join(__dirname, "../uploads"),
  limits: {
    fileSize: 1024 * 1024 * 16,
    files: 15,
  },
});

module.exports = uploadMiddleware;
