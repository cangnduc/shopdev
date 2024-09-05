// define the schema for our cart model
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    state: {
      type: String,
      required: true,
      enum: ["active", "completed", "failed", "pending"],
      default: "active",
    },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
        price: { type: Number, default: 0 },
        name: { type: String, required: true },
        shop: { type: Schema.Types.ObjectId, ref: "Shop" },
      },
    ],
    subTotal: { type: Number, default: 0 },
  },

  {
    timestamps: true,
  }
);

//set index for faster query
cartSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model("Cart", cartSchema);
