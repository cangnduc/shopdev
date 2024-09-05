/*
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
*/
const {
  convertArrayToObject,
  convertArrayToObject0,
} = require("../utils/objectFunction");
const cartSchema = require("../models/cart.model");
const { Types } = require("mongoose");
const { BadRequestError, NotFoundError } = require("../helpers/errorResponse");

class CartService {
  static async addProductToCart({ userID, product = {} }) {
    /*
    1. check cart exist or not
    2. if !cart, create one and add products to items list
    3. if cart, check if product exist in items list, if exist, update quantity, else add new product to items list
    4. calculate subTotal
    5. update cart with new items list and subTotal 
    */

    //check if cart exist
    let cart = await cartSchema.findOne({ user: userID });
    if (!cart) {
      cart = await cartSchema.create({ user: userID });
    }

    //check if product exist in items list

    const foundProduct = cart.items.find(
      (item) => item.product.toString() === product.product
    );
    if (foundProduct) {
      foundProduct.quantity += product.quantity;
      foundProduct.price = product.price;
    } else {
      cart.items.push(product);
    }

    //calculate subTotal
    cart.subTotal = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    return await cart.save();
  }

  static async getCartByUserID(userID) {
    const cart = await cartSchema.findOne({ user: userID });
    if (!cart) {
      throw new NotFoundError("Cart not found");
    }

    return cart;
  }
  static async deleteCartByUserID(userID) {
    return await cartSchema.deleteOne({ user: userID });
  }
  static async deleteProductFromCart(userID, productID) {
    const cart = await cartSchema.findOne({ user: userID });
    if (!cart) {
      throw new NotFoundError("Cart not found");
    }
    const deletedItem = await cartSchema.updateOne(
      { user: userID },
      { $pull: { items: { product: productID } } }
    );
    if (!deletedItem) {
      throw new NotFoundError("Item not found");
    }
    return deletedItem;
  }
  static async updateItemInCart({ userID, product = {} }) {
    const cart = await cartSchema.findOne({ user: userID });
    if (!cart) {
      throw new NotFoundError("Cart not found");
    }
    if (userID != cart.user.toString()) {
      throw new BadRequestError("User not authorized to update cart");
    }
    const foundProduct = cart.items.find(
      (item) => item.product.toString() === product.product
    );
    if (!foundProduct) {
      throw new NotFoundError("Product not found in cart");
    }
    foundProduct.quantity += product.quantity;
    foundProduct.price = product.price;
    if (foundProduct.quantity <= 0) {
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== product.product
      );
    }
    cart.subTotal = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    return await cart.save();
  }
}

module.exports = CartService;
