"use strict";
const {wrapAsyncRoutes} = require("../middlewares/asyncHandler");
const keyTokenSchema = require("../models/keytoken.model");
class KeyTokenService {
  static generateKeyToken = async ({ shopId, publicKey, privateKey, refreshToken }) => {
    try {
      // const publicKeyString = publicKey.toString();
      // const privateKeyString = privateKey.toString();
      // const tokens = await keyTokenSchema.create({ user: userId, publicKey: publicKeyString, privateKey: privateKeyString });
      // return tokens ? tokens.publicKey : null;

      const filter = { shop: shopId };
      const update = { publicKey, privateKey, refreshTokenUsed: [], refreshToken };
      const options = { new: true, upsert: true };
      const tokens = await keyTokenSchema.findOneAndUpdate(filter, update, options);
      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return {
        code: "xxxx",
        message: error.message,
      };
    }
  };
  static findByShopId = async (shopId) => {
    const tokens = await keyTokenSchema.findOne({ shop: shopId }).lean();
    return tokens;
  };
  static deleteByShopId = async (shopId) => {
    const result = await keyTokenSchema.deleteOne({ _id: shopId });

    return result;
  };
  static findByRefreshTokenUsed = async (refreshToken) => {
    return await keyTokenSchema.findOne({ refreshTokenUsed: refreshToken }).lean();
  };
  static findByRefreshToken = async(refreshToken) => {
    return await keyTokenSchema.findOne({ refreshToken })
  }
  static updateRefreshTokenUsed = async (_id, refreshToken) => {
    const result = await keyTokenSchema.updateOne({ _id }, { $push: { refreshTokenUsed: refreshToken } });
    console.log(result);
    return result;
  }
}
module.exports = KeyTokenService;
