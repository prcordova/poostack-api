const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const UserSchema = new Schema({
  username: { type: String, required: true, min: 4, unique: true, index: true }, // Adicione "index: true"
  password: { type: String, required: true },
  bio: { type: String, default: "" },
  avatarUrl: { type: String, default: "" },
  backgroundUrl: { type: String, default: "" },
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  pendingRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
  sentRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

const UserModel = model("User", UserSchema);

module.exports = UserModel;
