// routes/users.js

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
  getUserById, // Importando o controlador de buscar usuário por ID

  removeFriend, // Certifique-se de que isso esteja aqui
  checkFriendStatus, // Certifique-se de que isso também esteja aqui
} = require("../controllers/userController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", getProfile);
router.post("/logout", logout);

// Rota para pesquisar usuários pelo nome
router.get("/users/search", searchUser);

// Rotas para amizade

router.post("/users/friend-request", sendFriendRequest);
router.post("/users/accept-friend", acceptFriendRequest);
router.post("/users/remove-friend", removeFriend);
router.get("/users/friend-status", checkFriendStatus);

// Rota para editar o perfil do usuário
router.put("/users/update", updateProfile);

// Rota para buscar o perfil de um usuário específico
router.get("/users/:id", getUserById);

module.exports = router;
