const express = require("express");
const {
  register,
  login,
  getProfile,
  logout,
} = require("../controllers/userController");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", getProfile);
router.post("/logout", logout);

module.exports = router;
