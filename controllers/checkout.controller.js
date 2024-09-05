const SuccessResponse = require("../helpers/SuccessResponse");
const CheckoutService = require("../services/product.service.v1");
const { wrapAsyncRoutes } = require("../middlewares/asyncHandler");
const { BadRequestError } = require("../helpers/errorResponse");
const cartSchema = require("../models/cart.model");
const DiscountService = require("../services/discount.service");
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
  reviewCheckout = async (req, res) => {
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
    if (data.shop_orders && data.shop_orders.length > 0) {
      const shopOrderItems = data.shop_orders.flatMap((order) =>
        order.items.map((item) => ({
          productID: item.productID,
          quantity: item.quantity,
          price: item.price,
        }))
      );

      for (const item of cart.items) {
        if (
          !shopOrderItems.some(
            (shopItem) =>
              shopItem.productID === item.product.toString() &&
              shopItem.quantity === item.quantity
          )
        ) {
          throw new BadRequestError("Invalid item in shop_orders");
        }
      }
    }
    // for every shop_order in shop_orders, calculate total price and discount if shop_order.shop_discounts exist
    // if shop_order.shop_discounts exist, return shop_order.total_price, shop_order.discount, shop_order.total
    for (const shopOrder of data.shop_orders) {
      let price = 0;
      let discount = 0;
      let total = 0;
      const products = shopOrder.items.map((item) => ({
        product: item.productID,
        quantity: item.quantity,
        price: item.price,
      }));
      if (shopOrder.shop_discounts && shopOrder.shop_discounts.length > 0) {
        const discountAmount = await DiscountService.getDiscountAmount({
          code: shopOrder.shop_discounts[0].code,
          shop: shopOrder.shopID,
          userID,
          products,
        });

        price = discountAmount.totalOrder;
        discount = discountAmount.discountAmount;
        total = discountAmount.total;
        shopOrder.price = price;
        shopOrder.discount = discount;
        shopOrder.total += total;
        data.price += shopOrder.total;
        data.discount += shopOrder.discount;
      } else {
        price = products.reduce((acc, product) => {
          return acc + product.price * product.quantity;
        }, 0);

        shopOrder.price = price;
        shopOrder.total += price;
        data.finalPrice += shopOrder.price;
      }
    }
    data.payPrice = data.finalPrice - data.discount;
    res.json({
      message: "Checkout review successfully",
      data: data,
    });
    // const checkout = await CheckoutService.reviewCheckout({
    //   userID,
    //   cart,
    // });
    // return new SuccessResponse({
    //   message: "Checkout review successfully",
    //   data: checkout,
    // }).send(res);
  };
}

module.exports = wrapAsyncRoutes(new CheckoutController());
