const express = require("express");
const {
  createPost,
  getPosts,
  getPostById,
} = require("../controllers/postController");
const uploadMiddleware = require("../middleware/uploadMiddleware"); // Middleware para upload
const router = express.Router();

router.post("/post", uploadMiddleware.single("file"), createPost);
router.get("/posts", getPosts);
router.get("/post/:id", getPostById);

module.exports = router;
