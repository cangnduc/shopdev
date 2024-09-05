const SuccessResponse = require("../helpers/SuccessResponse");
const ProductService = require("../services/product.service.v1");
const { wrapAsyncRoutes } = require("../middlewares/asyncHandler");
const { BadRequestError } = require("../helpers/errorResponse");
const CartService = require("../services/cart.service");

/*
{
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    quantity: { type: Number, default: 1 },
    price: { type: Number, default: 0 },
    name: { type: String, required: true },
    shop: { type: Schema.Types.ObjectId, ref: "Shop" },
},
 {
        product: product.productID,
        quantity: product.quantity,
        price: productDetail.price,
        name: productDetail.name,
        shop: productDetail.shop,
      };
 */
class CartController {
  async addProductToCart(req, res) {
    const { product } = req.body;

    const userID = req.user.id;
    if (!userID) {
      throw new BadRequestError("user id is required");
    }
    if (!product) {
      throw new BadRequestError("products is required");
    }

    const productDetails = await ProductService.getProductById(
      product.productID,
      false
    );

    if (!productDetails) {
      throw new BadRequestError("No products found");
    }

    const cart = await CartService.addProductToCart({
      userID,
      product: {
        product: product.productID,
        quantity: product.quantity,
        price:
          productDetails.price == product.price
            ? product.price
            : productDetails.price,
        name: productDetails.name,
        shop: productDetails.shop,
      },
    });
    return new SuccessResponse({
      message: "Product added to cart successfully",
      data: cart,
    }).send(res);
  }
  async getCartByUserID(req, res) {
    const userID = req.user.id;
    if (!userID) {
      throw new BadRequestError("user id is required");
    }
    const cart = await CartService.getCartByUserID(userID);
    return new SuccessResponse({
      message: "Cart fetched successfully",
      data: cart,
    }).send(res);
  }
  async deleteProductFromCart(req, res) {
    const { productID } = req.params;
    const userID = req.user.id;
    if (!userID) {
      throw new BadRequestError("user id is required");
    }
    if (!productID) {
      throw new BadRequestError("product id is required");
    }
    const cart = await CartService.deleteProductFromCart({
      userID,
      productID,
    });
    return new SuccessResponse({
      message: "Product deleted from cart successfully",
      data: cart,
    }).send(res);
  }
  async updateItemInCart(req, res) {
    const { product } = req.body;
    const userID = req.user.id;
    if (!userID) {
      throw new BadRequestError("user id is required");
    }
    if (!product) {
      throw new BadRequestError("product is required");
    }
    const productDetails = await ProductService.getProductById(
      product.productID,
      false
    );

    const cart = await CartService.updateItemInCart({
      userID,
      product: {
        product: product.productID,
        quantity: product.quantity,
        price: productDetails.price,
        name: productDetails.name,
        shop: productDetails.shop,
      },
    });
    return new SuccessResponse({
      message: "Cart updated successfully",
      data: cart,
    }).send(res);
  }
  async deleteCartByUserID(req, res) {
    const userID = req.user.id;
    if (!userID) {
      throw new BadRequestError("user id is required");
    }
    const cart = await CartService.deleteCartByUserID(userID);
    return new SuccessResponse({
      message: "Cart deleted successfully",
      data: cart,
    }).send(res);
  }
}
module.exports = wrapAsyncRoutes(new CartController());
