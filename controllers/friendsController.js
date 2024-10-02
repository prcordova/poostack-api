const User = require("../models/User");

exports.sendFriendRequest = async (req, res) => {
  const { senderId, receiverId } = req.body;
  try {
    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!receiver || !sender) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    if (!receiver.pendingRequests.includes(senderId)) {
      receiver.pendingRequests.push(senderId);
      sender.sentRequests.push(receiverId);
      await receiver.save();
      await sender.save();
    }

    res.status(200).json({ message: "Pedido de amizade enviado!" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao enviar pedido de amizade" });
  }
};

exports.acceptFriendRequest = async (req, res) => {
  const { userId, senderId } = req.body;
  try {
    const user = await User.findById(userId);
    const sender = await User.findById(senderId);

    if (!user || !sender) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    if (user.pendingRequests.includes(senderId)) {
      user.friends.push(senderId);
      sender.friends.push(userId);

      // Remover os pedidos pendentes e enviados
      user.pendingRequests = user.pendingRequests.filter(
        (id) => id.toString() !== senderId
      );
      sender.sentRequests = sender.sentRequests.filter(
        (id) => id.toString() !== userId
      );

      await user.save();
      await sender.save();
    }

    res.status(200).json({ message: "Pedido de amizade aceito!" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao aceitar pedido de amizade" });
  }
};

exports.removeFriend = async (req, res) => {
  const { userId, friendId } = req.body;
  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    user.friends = user.friends.filter((id) => id.toString() !== friendId);
    friend.friends = friend.friends.filter((id) => id.toString() !== userId);

    await user.save();
    await friend.save();

    res.status(200).json({ message: "Amigo removido com sucesso!" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao remover amigo" });
  }
};
