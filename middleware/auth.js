// middlewares/auth.js
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

exports.verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Adiciona o usuário decodificado ao objeto req
    next(); // Continua para a próxima função
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
};
