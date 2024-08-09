const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, unique: true, required: true },
  passwordHash: { type: String },
  email: { type: String, unique: true, required: true },
  phoneNumber: { type: String, required: false, default: null },
  createdAt: { type: Date, default: Date.now },
  //passwordSalt: { type: String, required: true },

  //customAttributes: { type: Schema.Types.Mixed }, // Flexible field for custom attributes
});

const User = mongoose.model("User", userSchema);

module.exports = User;
