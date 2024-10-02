const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const UserSchema = new Schema({
  username: { type: String, required: true, min: 4, unique: true },
  password: { type: String, required: true },
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }], // Lista de amigos
  pendingRequests: [{ type: Schema.Types.ObjectId, ref: "User" }], // Pedidos pendentes
  sentRequests: [{ type: Schema.Types.ObjectId, ref: "User" }], // Pedidos enviados
});

const UserModel = model("User", UserSchema);

module.exports = UserModel;
