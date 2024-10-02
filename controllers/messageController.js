const Message = require("../models/Message");

exports.sendMessage = async (req, res) => {
  const { senderId, receiverId, content } = req.body;
  try {
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
    });
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ message: "Erro ao enviar mensagem" });
  }
};

exports.getMessages = async (req, res) => {
  const { userId, friendId } = req.query;
  try {
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Erro ao carregar mensagens" });
  }
};
