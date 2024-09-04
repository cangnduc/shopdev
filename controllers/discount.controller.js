const DiscountService = require("../services/discount.service");
const { wrapAsyncRoutes } = require("../middlewares/asyncHandler");
const { BadRequestError } = require("../helpers/errorResponse");

/*
const discountSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    type: { type: String, required: true, enum: ["percent", "fixed"] },
    value: { type: Number, required: true },
    status: { type: Boolean, default: true },
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
*/

const SuccessResponse = require("../helpers/SuccessResponse");
class DiscountController {
  async createDiscount(req, res) {
    const payload = {
      name: req.body.name,
      code: req.body.code,
      type: req.body.type,
      value: req.body.value,
      status: req.body.status || true,
      start: new Date(req.body.start),
      end: new Date(req.body.end),
      uses: req.body.uses,
      min_order: req.body.min_order || 0,
      //used: req.body.used || 0,
      limit: req.body.limit,
      shop: req.user.id,
      applicable_type: req.body.applicable_type,
      applicable_product:
        req.body.applicable_type === "specific"
          ? req.body.applicable_product
          : [],
      applicable_category:
        req.body.applicable_type === "specific"
          ? req.body.applicable_category
          : [],
      isPublished: req.body.isPublished || false,
    };
    // if (req.user.role === "shop") {
    //   payload.shop = req.user.id;
    // }
    // if (req.user.role === "admin") {
    //   payload.shop = req.body.shop;
    // }
    // if (req.user.role === "user") {
    //   throw new BadRequestError("you are not allowed to create discount");
    // }
    // check start date > end date and start date < current date
    if (payload.start > payload.end) {
      throw new BadRequestError("start date must be less than end date");
    }
    if (payload.start < new Date()) {
      throw new BadRequestError("start date must be greater than current date");
    }

    const result = await DiscountService.createDiscount(payload);
    new SuccessResponse({
      message: "create discount successfull",
      data: result,
    }).send(res);
  }
  async getProductByDiscount(req, res) {
    const shop = req.user?.id || req.body.shop || req.query.shop;
    const { code } = req.params || req.body;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const result = await DiscountService.getAllProductByDiscount(
      code,
      shop,
      page,
      limit
    );
    new SuccessResponse({
      message: "get product by discount successful",
      data: result,
    }).send(res);
  }
  async getDiscountCodeByShop(req, res) {
    const shop =
      req.user?.id || req.body.shop || req.query.shop || req.params.shop;

    const result = await DiscountService.getDiscountByShop(shop);
    new SuccessResponse({
      message: "get discount code by shop successful",
      data: result,
    }).send(res);
  }
  async getDiscountAmount(req, res) {
    const shop = req.user?.id || req.body.shop || req.query.shop;
    const code = req.params?.code || req.body.code || req.query.code;
    const userID = req.user?.id || req.body.userID || req.query.userID;
    const products = req.body.products;

    if (!products || !shop || !code) {
      throw new BadRequestError("missing required fields");
    }

    const result = await DiscountService.getDiscountAmount({
      code,
      shop,
      userID,
      products,
    });
    new SuccessResponse({
      message: "get discount amount successful",
      data: result,
    }).send(res);
  }
}

module.exports = wrapAsyncRoutes(new DiscountController());
