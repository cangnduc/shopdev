"use strict";
//const ProductService = require("../services/product.service");
const SuccessResponse = require("../helpers/SuccessResponse");
const { wrapAsyncRoutes } = require("../middlewares/asyncHandler");
const ProductServiceV1 = require("../services/product.service.v1");
const { BadRequestError } = require("../helpers/errorResponse");
const {
  product,
  clothing,
  electronic,
  furniture,
} = require("../models/product.model");
const { filter, update } = require("lodash");

class ProductController {
  async createProduct(req, res) {
    const { type } = req.body;
    const payload = {
      ...req.body,
      shop: req.user.id,
    };
    console.log("payload", payload);
    const result = await ProductServiceV1.createProduct(type, {
      ...req.body,
      shop: req.user.id,
    });
    new SuccessResponse({
      message: "create product successfull",
      data: result,
    }).send(res);
  }
  async getDraftsByShop(req, res) {
    const shopID = req.user.id;
    const result = await ProductServiceV1.findDraftProductByShop({
      shop: shopID,
      skip: 0,
      limit: 50,
    });
    new SuccessResponse({
      message: "find draft product successful",
      data: result,
    }).send(res);
  }
  async getPublishedByShop(req, res) {
    const shopID = req.user.id;
    const result = await ProductServiceV1.findPublishedProductByShop({
      shop: shopID,
      skip: 0,
      limit: 50,
    });
    new SuccessResponse({
      message: "find published product successful",
      data: result,
    }).send(res);
  }
  async publishProduct(req, res) {
    const shopID = req.user.id;
    const { productID } = req.params;
    const result = await ProductServiceV1.publishProduct({
      shop: shopID,
      productID,
    });
    new SuccessResponse({
      message: "publish product successful",
      data: result,
    }).send(res);
  }
  async unPublishProduct(req, res) {
    const shopID = req.user.id;
    const { productID } = req.params;
    const result = await ProductServiceV1.unPublishProduct({
      shop: shopID,
      productID,
    });
    new SuccessResponse({
      message: "unpublish product successful",
      data: result,
    }).send(res);
  }
  async searchProductByUser(req, res) {
    //http://localhost:3000/api/v1/product/search?keyword=iphone
    const { keySearch } = req.params;
    const regexSearch = new RegExp(keySearch, "i");

    const result = await ProductServiceV1.searchProductByUser(keySearch);
    new SuccessResponse({
      message: "search product successful",
      data: result,
    }).send(res);
  }
  async searchsProductByUser(req, res) {
    //http://localhost:3000/api/v1/product/search?keyword=iphone
    const { keySearch } = req.query;
    if (!keySearch) {
      throw new BadRequestError("Key search is required");
    }
    console.log("keySearch", keySearch);
    const regexSearch = new RegExp(keySearch, "i");

    const result = await ProductServiceV1.searchProductByUser(keySearch);
    new SuccessResponse({
      message: "search product successful",
      data: result,
    }).send(res);
  }
  async getProductsByUser(req, res) {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
      filter: req.query.filter || { isPublished: true },
      sort: req.query.sort == "ctime" ? { createdAt: -1 } : { updatedAt: -1 },
      select: req.query.select || [
        "name",
        "price",
        "thumbnail",
        "rating",
        "quantity",
      ],
    };
    const result = await ProductServiceV1.getAllProductByUser(
      { ...options } // Pass the options
    ); // Pass the filter object
    new SuccessResponse({
      message: "get product successful",
      data: result,
    }).send(res);
  }
  async getProductById(req, res) {
    const { productID } = req.params;
    const result = await ProductServiceV1.getProductById(productID);
    new SuccessResponse({
      message: "get product successful",
      data: result,
    }).send(res);
  }
  async updateProduct(req, res) {
    const { productID } = req.params;
    const shopID = req.user.id;
    console.log("productID", productID);
    // check only shop can update product or admin can update product of any shop
    if (shopID !== req.user.id) {
      throw new BadRequestError("You are not allowed to update this product");
    }

    const result = await ProductServiceV1.updateProduct({
      productID,
      type: req.body.type,
      payload: { ...req.body },
    });
    new SuccessResponse({
      message: "update product successful",
      data: result,
    }).send(res);
  }
  async toggleProduct(req, res) {
    const shopID = req.user.id;
    const { productID } = req.params;
    const result = await ProductServiceV1.toggleDraftProduct({
      shop: shopID,
      productID,
    });
    new SuccessResponse({
      message: "toggle product successful",
      data: result,
    }).send(res);
  }
}

module.exports = wrapAsyncRoutes(new ProductController());
