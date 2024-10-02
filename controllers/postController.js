const Post = require("../models/Post");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const secret = process.env.JWT_SECRET;

exports.createPost = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Nenhum arquivo foi enviado" });
  }

  const { originalname, path: tempPath } = req.file;
  const ext = path.extname(originalname);
  const filename = path.basename(tempPath) + ext;
  const newPath = path.join(__dirname, "../uploads", filename);

  try {
    fs.renameSync(tempPath, newPath);
  } catch (error) {
    console.error("Erro ao mover o arquivo:", error);
    return res.status(500).json({ message: "Erro ao mover o arquivo" });
  }

  const cover = `/uploads/${filename}`;

  const token = req.headers.authorization
    ? req.headers.authorization.split(" ")[1]
    : null;
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { title, summary, content } = req.body;
    try {
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover,
        author: info.id,
      });
      res.status(200).json(postDoc);
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar post" });
    }
  });
};

exports.getPosts = async (req, res) => {
  const posts = await Post.find()
    .populate("author", ["username"])
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(posts);
};

exports.getPostById = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id).populate("author", ["username"]);
  res.json(post);
};
