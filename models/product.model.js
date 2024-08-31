"use strict";

const { max } = require("lodash");
const { model, Schema } = require("mongoose");
const slugify = require("slugify");
const documentName = "product";

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    status: { type: Boolean, default: true },
    type: { type: String, required: true },
    slug: { type: String },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, "rating must be above 1"],
      max: [5, "rating must be below 5"],
      set: (v) => Math.round(v * 10) / 10,
    },
    quantity: { type: Number, required: true },
    shop: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
    thumbnail: { type: String, required: true },
    variations: { type: Array, default: [] },
    attributes: { type: Schema.Types.Mixed, default: {} },
    isDraft: { type: Boolean, default: true, index: true, select: false },
    isPublished: { type: Boolean, default: false, index: true, select: false },
  },
  {
    collection: "products",
    timestamps: true,
  }
);

//create index for search
//productSchema.index({ name: "text", description: "text" });
// create a slug for the product
productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});
const clothingSchema = new Schema(
  {
    brand: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    material: { type: String, required: true },
    shop: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
  },
  {
    collection: "clothings",
    timestamps: true,
  }
);
const electronicSchema = new Schema(
  {
    manufacturer: { type: String, required: true },
    color: { type: String, required: true },
    model: { type: String, required: true },
    shop: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
  },
  {
    collection: "electronics",
    timestamps: true,
  }
);
const furnitureSchema = new Schema(
  {
    manufacturer: { type: String, required: true },
    color: { type: String, required: true },
    model: { type: String, required: true },
    shop: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
  },
  {
    collection: "furnitures",
    timestamps: true,
  }
);
module.exports = {
  product: model(documentName, productSchema),
  clothing: model("clothing", clothingSchema),
  electronic: model("electronic", electronicSchema),
  furniture: model("furniture", furnitureSchema),
};

//generate an example of a product as json
