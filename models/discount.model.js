const { model, Schema } = require("mongoose");

const discountSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    type: { type: String, required: true, enum: ["percent", "fixed"] },
    value: { type: Number, required: true },
    max_value: { type: Number, default: 0 },
    status: { type: Boolean, default: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    uses: { type: Number, required: true },
    used: { type: Number, default: 0 },
    user_used: {
      type: Map,
      of: Number,
      default: {},
    },
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
discountSchema.index({ code: 1, shop: 1 }, { unique: true });
module.exports = {
  discount: model("Discount", discountSchema),
};
