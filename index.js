const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const Post = require("./models/Post");
const bcrypt = require("bcryptjs");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path"); // Mover o require('path') para antes do uso
require("dotenv").config();

app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "https://poostack.vercel.app",
      "https://poostack-proclabs.vercel.app",
    ],
  })
);

const uploadMiddleware = multer({
  dest: path.join(__dirname, "uploads/"),
  limits: {
    fileSize: 1024 * 1024 * 16,
    files: 15,
  },
});
const fs = require("fs");

const secret = process.env.JWT_SECRET;

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));

mongoose.connect(process.env.MONGODB_KEY, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await User.findOne({ username });

  if (existingUser) {
    return res.status(400).json("O nome de usuário já está em uso.");
  }

  try {
    const salt = bcrypt.genSaltSync(10);
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.status(200).json(userDoc);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });

  if (!userDoc) {
    return res.status(400).json("Usuário não encontrado");
  }

  const passOk = bcrypt.compareSync(password, userDoc.password);

  if (passOk) {
    // logged in
    jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) throw err;
      res.status(200).cookie("token", token).json({
        id: userDoc._id,
        username,
        token,
      });
    });
  } else {
    res.status(400).json("Credenciais inválidas");
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  try {
    const user = jwt.verify(token, secret);
    res.status(200).json(user);
  } catch (err) {
    res.status(401).json({ message: "Token inválido" });
  }
});

app.post("/logout", (req, res) => {
  res.status(200).cookie("token", "").json("ok");
});

app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
  const { originalname, path: tempPath } = req.file;
  const parts = originalname.split(".");
  const ext = parts[parts.length - 1];

  // Usar basename para obter o nome do arquivo sem o caminho absoluto
  const filename = path.basename(tempPath) + "." + ext;
  const newPath = path.join(__dirname, "uploads", filename); // Construir o caminho correto

  // Mover o arquivo para o novo caminho
  try {
    fs.renameSync(tempPath, newPath);
  } catch (error) {
    console.error("Erro ao mover o arquivo:", error);
    return res.status(500).json({ message: "Erro ao mover o arquivo" });
  }

  // Define 'cover' como caminho relativo
  const cover = `uploads/${filename}`;

  const token = req.headers.authorization
    ? req.headers.authorization.split(" ")[1]
    : null;
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) {
      console.error(err);
      return res.status(401).json({ error: "Invalid token" });
    }

    const { title, summary, content } = req.body;
    try {
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover, // Usa o caminho relativo
        author: info.id,
      });
      res.status(200).json(postDoc);
    } catch (error) {
      console.error("Erro ao criar post:", error);
      res.status(500).json({ message: "Erro ao criar post" });
    }
  });
});

app.put("/post", uploadMiddleware.single("file"), async (req, res) => {
  let newPath = null;
  let filename = null;
  if (req.file) {
    const { originalname, path: tempPath } = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    filename = tempPath.split("/").pop() + "." + ext;
    newPath = path.join(__dirname, "uploads", filename);
    fs.renameSync(tempPath, newPath);
  }

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { id, title, summary, content } = req.body;
    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json("you are not the author");
    }
    await Post.updateOne(
      { _id: id },
      {
        title,
        summary,
        content,
        cover: newPath ? `uploads/${filename}` : postDoc.cover,
      }
    );

    // Recupera o post atualizado para retornar na resposta
    const updatedPost = await Post.findById(id).populate("author", [
      "username",
    ]);

    res.status(200).json(updatedPost);
  });
});

app.get("/post", async (req, res) => {
  res.json(
    await Post.find()
      .populate("author", ["username"])
      .sort({ createdAt: -1 })
      .limit(20)
  );
});

app.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate("author", ["username"]);
  res.json(postDoc);
});

app.listen(8080 || 4000);
