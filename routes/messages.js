const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

// Rota para enviar mensagem
router.post("/messages", messageController.sendMessage);

// Rota para obter mensagens entre dois usuários
router.get("/messages", messageController.getMessages);

module.exports = router;
