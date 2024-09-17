const SuccessResponse = require("../helpers/SuccessResponse");
const CheckoutService = require("../services/checkout.service");
const { wrapAsyncRoutes } = require("../middlewares/asyncHandler");
const { BadRequestError } = require("../helpers/errorResponse");
const cartSchema = require("../models/cart.model");

/*
 "data": {
    "cartID": "66d9bb8c2eb9eed555f6a17f",
    "userID": 1001,
    "shop_orders": [
      {
        "shopID": "66bf14315d608930a45b9605",
        "items": [
          {
            "productID": "66cf374ec54a069d811e4723",
            "quantity": 5,
            "price": 12000
          },
          {
            "productID": "66cf57e57cedbd17806aed1d",
            "quantity": 2,
            "price": 1000
          }
        ],
        "shop_discounts": [
          {
            "code": "SAMPLECODE",
            "discountID": "66d807428f128e5019d72a2c",
            "shopID": "66bf14315d608930a45b9605"
          }
        ]
      },
      {
        "shopID": "66d9cacd6779dbf04929cd34",
        "items": [
          {
            "productID": "66d9d51e77d48cee74201830",
            "quantity": 5,
            "price": 12000
          },
          {
            "productID": "66d9cacd6779dbf04929cd34",
            "quantity": 2,
            "price": 1000
          }
        ],
        "shop_discounts": []
      }
    ]
  }
*/
class CheckoutController {
  async reviewCheckout(req, res) {
    let { ...data } = req.body;
    const userID = req.user.id;

    if (!userID) {
      throw new BadRequestError("user id is required");
    }
    // check if cart exist
    let cart = await cartSchema.findOne({ user: userID, _id: data.cartID });

    if (!cart) {
      throw new BadRequestError("Cart not found");
    }
    // check if data.shop_orders.items exist and productID, quantity, price is match with corresponding product in cart.items
    const result = await CheckoutService.reviewCheckout({ data, cart, userID });
    return new SuccessResponse({
      message: "Checkout review successfully",
      data: result,
    }).send(res);
  }
}

module.exports = wrapAsyncRoutes(new CheckoutController());
