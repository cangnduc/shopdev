const {
  convertArrayToObject,
  convertArrayToObject0,
} = require("../utils/objectFunction");

const { Types } = require("mongoose");
const { BadRequestError, NotFoundError } = require("../helpers/errorResponse");
const { discount } = require("../models/discount.model");
const { queryProduct } = require("../models/product.model");

class CheckoutService {
  static async reviewCheckout({ userID, cart }) {}
}

module.exports = CheckoutService;
