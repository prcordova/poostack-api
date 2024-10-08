const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;
exports.searchUser = async (req, res) => {
  const { username } = req.query;
  console.log("Query recebida:", username); // Verificar se a query foi recebida corretamente

  if (!username || username.length < 3) {
    return res
      .status(400)
      .json({ message: "A busca deve conter ao menos 3 caracteres." });
  }

  try {
    const users = await User.find(
      { username: new RegExp(username, "i") }, // Busca case insensitive
      "_id username"
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "Nenhum usuário encontrado." });
    }

    console.log("Usuários encontrados:", users); // Verificar se os usuários foram encontrados
    res.status(200).json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ message: "Erro ao buscar usuários" });
  }
};

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

      // Remove pedidos pendentes e enviados
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

exports.checkFriendStatus = async (req, res) => {
  const { userId, targetId } = req.query;

  try {
    const user = await User.findById(userId);
    const target = await User.findById(targetId);

    if (!user || !target) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    if (user.friends.includes(targetId)) {
      return res.status(200).json({ status: "friends" });
    }

    if (user.pendingRequests.includes(targetId)) {
      return res.status(200).json({ status: "pending" });
    }

    res.status(200).json({ status: "not_friends" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao verificar status de amizade" });
  }
};

exports.register = async (req, res) => {
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
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });

  if (!userDoc) {
    return res.status(400).json("Usuário não encontrado");
  }

  const passOk = bcrypt.compareSync(password, userDoc.password);

  if (passOk) {
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
};

exports.getProfile = (req, res) => {
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
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, "-password");
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Retorna o perfil do usuário com avatar e background URLs
    res.status(200).json({
      id: user._id,
      username: user.username,
      avatarUrl: user.avatarUrl ? `${API_BASE_URL}${user.avatarUrl}` : null, // Gera a URL completa do avatar
      backgroundUrl: user.backgroundUrl
        ? `${API_BASE_URL}${user.backgroundUrl}`
        : null, // Gera a URL completa do background
      bio: user.bio,
      friends: user.friends,
      pendingRequests: user.pendingRequests,
      sentRequests: user.sentRequests,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar o usuário" });
  }
};

exports.logout = (req, res) => {
  res.status(200).cookie("token", "").json("ok");
};

exports.updateProfile = async (req, res) => {
  const { id } = req.params;
  const { username, bio } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Atualizando campos de texto
    user.username = username || user.username;
    user.bio = bio || user.bio;

    // Atualizando o avatar e background se forem enviados
    if (req.files) {
      if (req.files.avatar) {
        user.avatarUrl = `/uploads/${req.files.avatar[0].filename}`;
      }
      if (req.files.background) {
        user.backgroundUrl = `/uploads/${req.files.background[0].filename}`;
      }
    }

    await user.save();

    // Retornar o usuário atualizado
    res.status(200).json({ message: "Perfil atualizado com sucesso", user });
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar perfil", error });
  }
};
