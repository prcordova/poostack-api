const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;

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

exports.logout = (req, res) => {
  res.status(200).cookie("token", "").json("ok");
};
