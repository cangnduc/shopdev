"use strict";
const ProductService = require("../services/product.service");
const SuccessResponse = require("../helpers/SuccessResponse");
const { wrapAsyncRoutes } = require("../middlewares/asyncHandler");
const ProductServiceV1 = require("../services/product.service.v1");
class ProductController {
  async createProduct(req, res) {
    const { type } = req.body;
    const payload = {
      ...req.body,
      shop: req.user.id,
    };

    const result = await ProductServiceV1.createProduct(type, {
      ...req.body,
      shop: req.user.id,
    });
    new SuccessResponse({
      message: "create product successfull",
      data: result,
    }).send(res);
  }
}

module.exports = wrapAsyncRoutes(new ProductController());
