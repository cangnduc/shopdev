// define user model schema

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    phone: { type: String },
    //address is a list of addresses schema
    address: [{ type: Schema.Types.ObjectId, ref: "Address" }],
    avatar: { type: String },
    resetPasswordLink: { data: String, default: "" },
    cart: { type: Schema.Types.ObjectId, ref: "Cart" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

//generate sample data for user model as json
const sampleUserData = {
  username: "admin",
  email: "",
  password: "",
  role: "admin",
  phone: "",
  address: [],
  avatar: "",
  resetPasswordLink: "",
  cart: "",
};
