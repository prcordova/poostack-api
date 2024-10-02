const express = require("express");
const {
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
} = require("../controllers/friendsController");

const router = express.Router();

// Rota para enviar pedido de amizade
router.post("/friend-request", sendFriendRequest);

// Rota para aceitar pedido de amizade
router.post("/accept-friend", acceptFriendRequest);

// Rota para remover um amigo
router.post("/remove-friend", removeFriend);

module.exports = router;
