const { product, clothing, electronic } = require("../models/product.model");
const { BadRequestError } = require("../helpers/errorResponse");
/*
  name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    status: { type: Boolean, default: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
    shop: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
    thumbnail: { type: String, required: true },
    attributes: { type: Schema.Types.Mixed, default: {} },
    module.exports = {
  product: model(documentName, productSchema),
  clothing: model("clothing", clothingSchema),
  electronic: model("electronic", electronicSchema),
};

*/
class ProductFactory {
  static async createProduct(type, payload) {
    switch (type) {
      case "clothing":
        return new Clothing(payload).createProduct();
      case "electronic":
        return new Electronic(payload).createProduct();
      default:
        throw new BadRequestError(`Invalid product type ${type}`);
    }
  }
}

class Product {
  constructor({
    name,
    price,
    description,
    type,
    image,
    thumbnail,
    status,
    quantity,
    shop,
    attributes,
  }) {
    this.name = name;
    this.price = price;
    this.description = description;
    this.type = type;
    this.image = image;
    this.status = status;
    this.thumbnail = thumbnail;
    this.quantity = quantity;
    this.shop = shop;
    this.attributes = attributes;
  }
  // create new product
  async createProduct(id) {
    try {
      const newProduct = product.create({
        ...this,
        _id: id,
      });
      if (!newProduct) {
        throw new BadRequestError("Error creating product");
      }

      return newProduct;
    } catch (error) {
      throw new BadRequestError("Error creating product");
    }
  }
}

class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.attributes,
      shop: this.shop,
    });
    if (!newClothing) {
      throw new BadRequestError("Error creating clothing");
    }
    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) {
      throw new BadRequestError("Error creating product");
    }

    return newProduct;
  }
}

class Electronic extends Product {
  async createProduct() {
    const newElectronic = new electronic({
      ...this.attributes,
      shop: this.shop,
    });
    if (!newElectronic) {
      throw new BadRequestError("Error creating electronic");
    }
    const newProduct = await super.createProduct(newElectronic._id);
    if (!newProduct) {
      throw new BadRequestError("Error creating product");
    }
    await newElectronic.save();
    return newProduct;
  }
}

module.exports = ProductFactory;
