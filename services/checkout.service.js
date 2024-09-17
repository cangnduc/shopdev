const {
  convertArrayToObject,
  convertArrayToObject0,
} = require("../utils/objectFunction");

const { Types } = require("mongoose");
const { BadRequestError, NotFoundError } = require("../helpers/errorResponse");
const { discount } = require("../models/discount.model");
const { queryProduct } = require("../models/product.model");
const DiscountService = require("../services/discount.service");
class CheckoutService {
  static async reviewCheckout({ data, cart, userID }) {
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

    // Initialize the total values
    data.price = 0;
    data.discount = 0;
    data.finalPrice = 0;

    // for every shop_order in shop_orders, calculate total price and discount if shop_order.shop_discounts exist
    // if shop_order.shop_discounts exist, return shop_order.total_price, shop_order.discount, shop_order.total
    for (const shopOrder of data.shop_orders) {
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
        console.log("discountAmount", discountAmount);
        shopOrder.price = discountAmount.totalOrder;
        shopOrder.discount = discountAmount.discountAmount;
        shopOrder.total =
          discountAmount.totalOrder - discountAmount.discountAmount;
        data.price += shopOrder.price;
        data.discount += shopOrder.discount;
        data.finalPrice += shopOrder.total;
      } else {
        const price = products.reduce((acc, product) => {
          return acc + product.price * product.quantity;
        }, 0);

        shopOrder.price = price;
        shopOrder.discount = 0;
        shopOrder.total = price;
        data.price += price;
        data.discount += 0;
        data.finalPrice += price;
      }
    }
    return data;
  }
}

module.exports = CheckoutService;
