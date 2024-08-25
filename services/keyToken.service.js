"use strict";
const SuccessResponse = require("../helpers/SuccessResponse");
const { wrapAsyncRoutes } = require("../middlewares/asyncHandler");
const keyTokenSchema = require("../models/keyToken.model");

/* this is the keyTokenSchema
  const keyTokenSchema = new Schema(
  {
    shop: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
    publicKey: { type: String, required: true },
    privateKey: { type: String, required: true },
    refreshTokenUsed: [
      {
        token: { type: String, required: true },
        device: { type: String, required: true },
        createAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 7 },
      },
    ],
    refreshTokens: [
      {
        token: { type: String, required: true },
        device: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);
*/

class KeyTokenService {
  static generateKeyToken = async ({
    shopId,
    publicKey,
    privateKey,
    refreshToken,
    device,
  }) => {
    try {
      const keyshop = await keyTokenSchema.findOneAndUpdate(
        { shop: shopId },
        {
          $push: {
            refreshTokens: { device, token: refreshToken },
          },
          $setOnInsert: {
            publicKey: publicKey,
            privateKey: privateKey,
          },
        },
        { upsert: true, new: true }
      );

      return keyshop ? keyshop.publicKey : null;
    } catch (error) {
      return {
        code: "xxxx",
        message: error.message,
      };
    }
  };
  static findByShopId = async (shopId) => {
    const keyshop = await keyTokenSchema.findOne({ shop: shopId });
    return keyshop;
  };
  static deleteByKeyShop = async (refreshTokenId) => {
    try {
      // delete the refresh token from the refreshTokens array that mathces
      // the refreshTokenId
      await keyTokenSchema.updateOne(
        { "refreshTokens._id": refreshTokenId },
        { $pull: { refreshTokens: { _id: refreshTokenId } } }
      );
    } catch (error) {
      throw new Error(error.message);
    }
  };

  static findByRefreshTokenUsed = async (refreshToken) => {
    return await keyTokenSchema.findOne({
      "refreshTokenUsed.token": refreshToken,
    });
  };
  static findByRefreshToken = async (refreshToken) => {
    return await keyTokenSchema.findOne({
      "refreshTokens.token": refreshToken,
    });
  };
  static updateRefreshTokenUsed = async (
    foundKeyToken,
    refreshToken,
    device
  ) => {
    //get the _id of the refresh token in the refreshTokens array
    const refreshTokenId = foundKeyToken.refreshTokens.find(
      (token) => token.token === refreshToken
    );
    // add refresh token to refreshTokensUsed array
    foundKeyToken.refreshTokenUsed.push({
      _id: refreshTokenId._id,
      token: refreshToken,
      device: device,
    });
    await foundKeyToken.save();
    return true;
  };
  static updateRefreshTokens = async (
    foundKeyToken,
    newRefreshToken,
    refreshToken,
    device
  ) => {
    //update the refresh token with newRefreshToken in the refreshTokens array
    foundKeyToken.refreshTokens = foundKeyToken.refreshTokens.map((token) => {
      if (token.token === refreshToken) {
        token.token = newRefreshToken;
        token.device = device;
      }
      return token;
    });
    // foundKeyToken.refreshTokens = foundKeyToken.refreshTokens.filter(
    //   (token) => token.token !== refreshToken
    // );
    // foundKeyToken.refreshTokens.push({
    //   token: newRefreshToken,
    //   device: device,
    // });
    await foundKeyToken.save();
    return true;
  };
}
module.exports = KeyTokenService;
