"use strict";
/*
const discountSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    type: { type: String, required: true, enum: ["percent", "fixed"] },
    value: { type: Number, required: true },
    status: { type: Boolean, default: true },
    max_value: { type: Number, default: 0 },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    uses: { type: Number, required: true },
    used: { type: Number, default: 0 },
    user_used: { type: Array, default: [] },
    min_order: { type: Number, default: 0, required: true },
    limit: { type: Number, required: true }, // limit per user
    shop: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
    applicable_product: { type: Array, default: [] }, // applicable products
    applicable_category: { type: Array, default: [] }, // applicable categories
    applicable_user: { type: Array, default: [] }, // applicable shops
    applicable_type: {
      type: String,
      enum: ["all", "specific"],
      required: true,
    },
    isPublished: { type: Boolean, default: false, index: true, select: false },
  },
  {
    collection: "discounts",
    timestamps: true,
  }
);
*/ const {
  convertArrayToObject,
  convertArrayToObject0,
} = require("../utils/objectFunction");

const { Types } = require("mongoose");
const { BadRequestError, NotFoundError } = require("../helpers/errorResponse");
const { discount } = require("../models/discount.model");
const { queryProduct } = require("../models/product.model");

class DiscountService {
  static async findDiscountByCodeAndShop(code, shop, lean = true) {
    const foundDiscount = await discount.findOne({
      code: code,
      shop: new Types.ObjectId(shop),
    });
    if (!foundDiscount) {
      throw new NotFoundError("Discount not found");
    }
    if (lean) {
      return foundDiscount.toObject();
    }
    return foundDiscount;
  }
  static async createDiscount(payload) {
    try {
      //find discount by code and shop
      const foundDiscount = await this.findDiscountByCodeAndShop(
        payload.code,
        payload.shop
      );
      if (foundDiscount && foundDiscount.status) {
        throw new BadRequestError("discount code already exist");
      }
      //create discount
      const resultDiscount = await discount.create(payload);
      return resultDiscount;
    } catch (error) {
      throw error;
    }
  }
  static async getAllProductByDiscount(code, shop, page, limit) {
    const skip = (page - 1) * limit;
    try {
      const foundDiscount = await discount
        .findOne({
          code: code,
          shop: new Types.ObjectId(shop),
        })
        .lean();

      if (!foundDiscount) {
        throw new BadRequestError("Discount not found");
      }
      //   if (!foundDiscount.isPublished) {
      //     throw new BadRequestError("Discount not published");
      //   }
      let result;
      const select = ["name", "price", "description", "image"];

      if (foundDiscount.applicable_type === "all") {
        const query = {
          shop: new Types.ObjectId(shop),
          //isPublished: true,
        };

        result = await queryProduct({ query, skip, limit, select });
      }
      if (foundDiscount.applicable_type === "specific") {
        const query = {
          shop: new Types.ObjectId(shop),
          _id: { $in: foundDiscount.applicable_product },
          isPublished: true,
        };
        result = await queryProduct({ query, skip, limit, select });
      }
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async getDiscountByShop(shop) {
    try {
      const result = await discount
        .find({ shop })
        .select(
          convertArrayToObject([
            "name",
            "code",
            "type",
            "value",
            "status",
            "start",
            "end",
            "uses",
            "min_order",
            "limit",
            "applicable_type",
            "applicable_product",
          ])
        )
        .lean();

      // check if the result is empty or not, if empty return null, else return the result
      return result.length === 0 ? null : result;
    } catch (error) {
      throw new NotFoundError("Discount not found");
    }
  }
  static async validateDiscount(foundDiscount, userID) {
    if (foundDiscount == null) {
      throw new NotFoundError("Discount not found");
    }
    if (!foundDiscount.status) {
      throw new BadRequestError("Discount not active");
    }
    if (foundDiscount.start > new Date()) {
      throw new BadRequestError("Discount not started yet");
    }
    if (foundDiscount.end < new Date()) {
      throw new BadRequestError("Discount expired");
    }
    if (foundDiscount.uses <= foundDiscount.used) {
      throw new BadRequestError("Discount limit reached");
    }
    // Additional checks as needed...

    return true;
  }
  static async getDiscountAmount({ code, shop, userID, products = [] }) {
    const foundDiscount = await this.findDiscountByCodeAndShop(code, shop);
    await this.validateDiscount(foundDiscount, userID);

    let applicableTotal = 0;
    let nonApplicableTotal = 0;

    if (foundDiscount.applicable_type === "specific") {
      products.forEach((product) => {
        if (foundDiscount.applicable_product.includes(product.product)) {
          applicableTotal += product.price * product.quantity;
        } else {
          nonApplicableTotal += product.price * product.quantity;
        }
      });
    } else {
      applicableTotal = products.reduce(
        (acc, product) => acc + product.price * product.quantity,
        0
      );
    }

    const totalOrder = applicableTotal + nonApplicableTotal;

    if (foundDiscount.min_order > 0 && totalOrder < foundDiscount.min_order) {
      throw new BadRequestError("Minimum order not reached");
    }

    const discountAmount =
      foundDiscount.type === "percent"
        ? foundDiscount.max_value === 0
          ? (foundDiscount.value / 100) * applicableTotal
          : Math.min(
              (foundDiscount.value / 100) * applicableTotal,
              foundDiscount.max_value
            )
        : Math.min(foundDiscount.value, applicableTotal);

    return {
      totalOrder,
      discountAmount,
      total: totalOrder - discountAmount,
    };
  }
  static async deleteDiscount(code, shop) {
    try {
      const result = await discount.findOneAndDelete({
        code: code,
        shop: new Types.ObjectId(shop),
      });
      if (!result) {
        return new NotFoundError("Discount not found");
      }
      return result;
    } catch (error) {
      throw new NotFoundError(`Discount error ${error.message}`);
    }
  }
  static async cancelDiscount(code, shop, userID) {
    try {
      //check if discount exist
      const foundDiscount = await discount.findOne({
        code: code,
        shop: new Types.ObjectId(shop),
      });
      if (!foundDiscount) {
        throw new NotFoundError("Discount not found for Cancellation");
      }
      //check if user has used the discount
      if (!foundDiscount.user_used.has(userID)) {
        throw new BadRequestError("Discount not used by user");
      }

      const usageCount = foundDiscount.user_used.get(userID);
      if (usageCount > 1) {
        foundDiscount.user_used.set(userID, usageCount - 1);
      } else {
        foundDiscount.user_used.delete(userID);
      }
      foundDiscount.used -= 1;

      await foundDiscount.save();
      return foundDiscount;
    } catch (error) {
      throw new NotFoundError(`Discount error ${error.message}`);
    }
  }
  static async addOrRemoveProductToDiscount({
    code,
    shop,
    action = "add",
    productID,
  }) {
    const foundDiscount = await this.findDiscountByCodeAndShop(
      code,
      shop,
      false
    );

    if (action === "add") {
      foundDiscount.applicable_product.push(productID);
    } else {
      foundDiscount.applicable_product =
        foundDiscount.applicable_product.filter(
          (id) => id.toString() !== productID.toString()
        );
    }
    await foundDiscount.save();
    return foundDiscount;
  }
  static async updateDiscount(code, shop, payload) {
    try {
      const result = await discount.findOneAndUpdate(
        { code: code, shop: new Types.ObjectId(shop) },
        { $set: payload },
        { new: true }
      );
      if (!result) {
        throw new NotFoundError("Discount not found");
      }
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DiscountService;
