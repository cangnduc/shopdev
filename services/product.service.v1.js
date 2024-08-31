const {
  product,
  clothing,
  electronic,
  furniture,
} = require("../models/product.model");
const { removeNullUndefinedKeys } = require("../utils/remove.null.object");
const updateNestedObject = require("../utils/update.nested.object");
// import Type from mongoose
const { Types } = require("mongoose");
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
// ["a", "b", "c"] => {a: 1, b: 1, c: 1}
const convertArrayToObject = (array) => {
  return array.reduce((acc, cur) => {
    acc[cur] = 1;
    return acc;
  }, {});
};
const convertArrayToObject0 = (array) => {
  return array.reduce((acc, cur) => {
    acc[cur] = 0;
    return acc;
  }, {});
};

const queryProduct = async (query, skip, limit) => {
  return await product
    .find(query)
    .populate("shop", "email -_id")
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};
const toglePublish = async (productID, shop, publish) => {
  const foundProduct = await product
    .findOne({
      _id: new Types.ObjectId(productID),
      shop: new Types.ObjectId(shop),
    })
    .select("+isDraft +isPublished");
  if (!foundProduct) {
    throw new BadRequestError("Product not found");
  }
  foundProduct.isDraft = !publish;
  foundProduct.isPublished = publish;
  const result = await foundProduct.save();
  if (!result) {
    throw new BadRequestError("Error unpublishing product");
  }
  return result;
};
const updateProductService = async ({
  productID,
  payload,
  model,
  isNew = true,
}) => {
  payload = removeNullUndefinedKeys(payload);
  // Construct the update object using $set
  update = updateNestedObject(payload);
  return await model.findByIdAndUpdate(
    { _id: new Types.ObjectId(productID) },
    update,
    { new: true }
  );
};
class ProductFactory {
  static productRegister = {};
  static registerProductType(type, classType) {
    this.productRegister[type] = classType;
  }
  static async createProduct(type, payload) {
    const productType = this.productRegister[type];
    if (!productType) {
      throw new BadRequestError(`Invalid product type ${type}`);
    }
    return new productType(payload).createProduct();
  }
  static async updateProduct({ payload, productID, type }) {
    const productType = this.productRegister[type];

    if (!productType) {
      throw new BadRequestError(`Invalid product type ${type}`);
    }
    return new productType(payload).updateProduct(productID);
  }
  /**
   * @description find draft product by shop
   * @param {shop, skip, limit} param0
   * @returns {Promise}
   */
  static async findDraftProductByShop({ shop, skip = 0, litmit = 50 }) {
    const query = {
      shop,
      isDraft: true,
    };
    return await queryProduct(query, skip, litmit);
  }
  static async findPublishedProductByShop({ shop, skip = 0, litmit = 50 }) {
    const query = {
      shop,
      isPublished: true,
    };
    return await queryProduct(query, skip, litmit);
  }
  static async publishProduct({ shop, productID }) {
    const result = await toglePublish(productID, shop, true);
    // const { modifiedCount } = await product.updateOne(
    //   {
    //     _id: new Types.ObjectId(productID),
    //     shop: new Types.ObjectId(shop),
    //   },
    //   {
    //     $set: {
    //       isDraft: true,
    //       isPublished: false,
    //     },
    //   }
    // );
    //console.log("modifiedCount", modifiedCount);
    // if (modifiedCount != 1) {
    //   throw new BadRequestError("Error publishing product");
    // }

    return result;
  }
  static async unPublishProduct({ shop, productID }) {
    const result = await toglePublish(productID, shop, false);
    return result;
  }
  static async toggleDraftProduct({ shop, productID }) {
    const foundProduct = await product
      .findOne({
        _id: new Types.ObjectId(productID),
        shop: new Types.ObjectId(shop),
      })
      .select("+isDraft +isPublished");
    if (!foundProduct) {
      throw new BadRequestError("Product not found");
    }

    foundProduct.isDraft = !foundProduct.isDraft;
    foundProduct.isPublished = !foundProduct.isPublished;

    const result = await foundProduct.save();
    if (!result) {
      throw new BadRequestError("Error toggle draft product");
    }

    return result;
  }
  static async searchProductByUser(keySearch) {
    return await product
      .find(
        {
          $text: { $search: keySearch },
          isPublished: true,
        },
        { score: { $meta: "textScore" } }
      )
      .sort({ score: { $meta: "textScore" } })
      .lean()
      .exec();
  }
  static async getAllProductByUser({ limit, page, filter, sort, select }) {
    if (page < 1) {
      page = 1;
    }

    const skip = (page - 1) * limit;
    return await product
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select(convertArrayToObject(select))
      .lean()
      .exec();
  }
  static async getProductById(productID) {
    const unSelect = [
      "isDraft",
      "isPublished",
      "createdAt",
      "updatedAt",
      "__v",
    ];
    return await product
      .findOne({ _id: new Types.ObjectId(productID) })
      .populate("shop", "email -_id")
      .select(convertArrayToObject0(unSelect))
      .lean()
      .exec();
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
  async updateProduct(productID, payload) {
    return await updateProductService({
      productID,
      payload,
      model: product,
    });
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
  async updateProduct(productID) {
    const objectParams = this;
    if (objectParams.attributes) {
      await updateProductService({
        productID,
        payload: this.attributes,
        model: clothing,
      });
    }
    const updatedProduct = await super.updateProduct(productID, objectParams);
    return updatedProduct;
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
  async updateProduct(productID) {
    const objectParams = this;
    if (objectParams.attributes) {
      await updateProductService({
        productID,
        payload: this.attributes,
        model: electronic,
      });
    }
    const updatedProduct = await super.updateProduct(productID, objectParams);
    return updatedProduct;
  }
}
class Furniture extends Product {
  async createProduct() {
    const newFurniture = new furniture({
      ...this.attributes,
      shop: this.shop,
    });
    if (!newFurniture) {
      throw new BadRequestError("Error creating furniture");
    }
    const newProduct = await super.createProduct(newFurniture._id);
    if (!newProduct) {
      throw new BadRequestError("Error creating product");
    }
    await newFurniture.save();
    return newProduct;
  }
}

ProductFactory.registerProductType("clothing", Clothing);
ProductFactory.registerProductType("electronic", Electronic);
ProductFactory.registerProductType("furniture", Furniture);
module.exports = ProductFactory;
