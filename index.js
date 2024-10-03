const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const friendRoutes = require("./routes/friends");

const app = express();

// Aumentar o limite de tamanho do payload
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(
  cors({
    credentials: true,
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Conectando ao MongoDB
mongoose.connect(process.env.MONGODB_KEY, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Configurando rotas
app.use("/api", userRoutes);
app.use("/api", postRoutes);
app.use("/api", friendRoutes);

// Definindo a porta, utilizando a variável de ambiente PORT fornecida pelo Back4App ou a porta 8080 como fallback
const port = 8080 || 4000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
