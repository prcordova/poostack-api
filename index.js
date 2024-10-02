const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");

const app = express();

app.use(
  cors({
    credentials: true,
    origin: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose.connect(process.env.MONGODB_KEY, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Usar rotas específicas
app.use("/api", userRoutes);
app.use("/api", postRoutes);

app.listen(8080, () => {
  console.log("Servidor rodando na porta 8080");
});
