const express = require("express");
const {
  register,
  login,
  getProfile,
  logout,
  searchUser,
  sendFriendRequest,
  acceptFriendRequest,
  updateProfile,
  getUserById,
  removeFriend,
  checkFriendStatus,
} = require("../controllers/userController");

const { verifyToken } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

// Configuração de multer para uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Define a pasta para salvar as imagens
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Define um nome único para o arquivo
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB por arquivo
});

const router = express.Router();

// Rotas de usuário
router.post("/register", register);
router.post("/login", login);
router.get("/profile", getProfile);
router.post("/logout", logout);

// Rota para atualizar o perfil (incluindo avatar e background)
router.put(
  "/users/update/:id", // A rota agora espera o ID do usuário na URL
  verifyToken,
  upload.single("file"), // Aceita o upload de avatar ou background
  updateProfile
);

router.post("/users/friend-request", sendFriendRequest);
router.post("/users/accept-friend", acceptFriendRequest);
router.post("/users/remove-friend", removeFriend);
router.get("/users/friend-status", checkFriendStatus);
router.get("/users/:id", getUserById);

module.exports = router;
