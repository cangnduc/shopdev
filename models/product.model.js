"use strict";

const { max } = require("lodash");
const { model, Schema } = require("mongoose");
const slugify = require("slugify");
const documentName = "product";
const {
  convertArrayToObject,
  convertArrayToObject0,
} = require("../utils/objectFunction");
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
const product = model(documentName, productSchema);
const queryProduct = async ({
  query,
  skip,
  limit,
  sort = "ctime",
  select = [
    "name",
    "price",
    "description",
    "image",
    "status",
    "type",
    "slug",
    "rating",
    "quantity",
    "shop",
    "thumbnail",
    "variations",
    "attributes",
    "isDraft",
    "isPublished",
    "rating",
  ],
}) => {
  console.log(select);
  // select = select?.length
  //   ? select
  //   : [
  //       "name",
  //       "price",
  //       "description",
  //       "image",
  //       "status",
  //       "type",
  //       "slug",
  //       "rating",
  //       "quantity",
  //       "shop",
  //       "thumbnail",
  //       "variations",
  //       "attributes",
  //       "isDraft",
  //       "isPublished",
  //       "rating",
  //     ];
  // sort = 'ctime' | 'rating' | 'price', if ctime, sort by created time, if rating, sort by rating, if price, sort by price
  const sort_item = {};
  if (sort === "ctime") {
    sort_item.ctime = -1;
  } else if (sort === "rating") {
    sort_item.rating = -1;
  } else if (sort === "price") {
    sort_item.price = 1;
  }

  return await product
    .find(query)
    .populate("shop", "email -_id")
    .sort(sort_item)
    .skip(skip)
    .limit(limit)
    .select(convertArrayToObject(select))
    .lean()
    .exec();
};
module.exports = {
  product,
  clothing: model("clothing", clothingSchema),
  electronic: model("electronic", electronicSchema),
  furniture: model("furniture", furnitureSchema),
  queryProduct,
};

//generate an example of a product as json
