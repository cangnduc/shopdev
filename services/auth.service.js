"use strict";
const shopSchema = require("../models/shop.model");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const bcrypt = require("bcryptjs");
const tokenGenerator = require("../helpers/tokenGeneratetor");
const _ = require("lodash");
const JWT = require("jsonwebtoken");
const { SuccessResponse } = require("../helpers/SuccessResponse");
const redisClient = require("../database/redis");
const {
  ErorrResponse,
  NotFoundError,
  ForbiddenError,
} = require("../helpers/errorResponse");
const { error } = require("console");
const RolesShop = {
  SHOP: "shop",
  WRITER: "writer",
  ADMIN: "admin",
  EDITOR: "editor",
};
class AuthService {
  static logout = async (shopkey, refreshToken, device) => {
    const result = await KeyTokenService.deleteByKeyShop(
      shopkey,
      refreshToken,
      device
    );
    if (!result) throw new ErorrResponse("Error in logout");

    return { message: "Logout successfully" };
  };
  static login = async ({ email, password, device, refreshToken = {} }) => {
    if (!email || !password) {
      throw new ErorrResponse("Email and password are required");
    }
    const shop = await shopSchema
      .findOne({ email })
      .select({ email: 1, _id: 1, roles: 1, name: 1, password: 1 })
      .lean();

    if (!shop) {
      console.log("Shop not found");
      throw new NotFoundError("Shop not found");
    }

    // set the device id to
    const isMatch = await bcrypt.compare(password, shop.password);
    if (!isMatch) {
      throw new ErorrResponse("Invalid password");
    }

    const keyToken = await KeyTokenService.findByShopId(shop._id);
    if (!keyToken) {
      throw new NotFoundError("Key token not found");
    }
    // generate access token and refresh token, tokens: {accessToken, refreshToken}
    const tokens = tokenGenerator(
      {
        id: shop._id,
        email: shop.email,
        role: shop.roles,
        device,
      },

      keyToken.privateKey
    );

    // generate public key string and save {shopId, publicKey, privatekey, refreshtokens[], usedRefreshTokens[]} in keytoken collection to mongodb
    const publicKeyString = await KeyTokenService.generateKeyToken({
      shopId: shop._id,
      publicKey: shop.publicKey,
      privateKey: shop.privateKey,
      refreshToken: tokens.refreshToken,
      device,
    });
    if (!publicKeyString) {
      throw new ErorrResponse("Error generating key token");
    }

    return {
      code: "200",
      message: "Login successfully",
      data: { shop: _.pick(shop, ["email", "roles", "name"]), tokens },
    };
  };
  static register = async ({ name, email, password, device }) => {
    const holderShop = await shopSchema.findOne({ email }).lean();

    if (holderShop) {
      throw new ErorrResponse("Email already exists");
    }
    const hassedPassword = await bcrypt.hash(password, 10);

    const newShop = new shopSchema({
      name,
      email,
      password: hassedPassword,
      roles: [RolesShop.SHOP],
    });

    if (newShop) {
      // generate public and private key pair, type of object is Buffer
      const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: "spki",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem",
        },
      });

      const tokens = tokenGenerator(
        { id: newShop._id, email: newShop.email, roles: newShop.roles, device },
        privateKey
      );
      // generate public key string and save {userId, publicKey} in keytoken collection
      const publicKeyString = await KeyTokenService.generateKeyToken({
        shopId: newShop._id,
        publicKey,
        privateKey,
        refreshToken: tokens.refreshToken,
        device,
      });

      if (!publicKeyString) {
        throw new ErorrResponse("Error generating key token");
      }
      // convert public key string to public key object
      //const publicKeyObject = crypto.createPublicKey(publicKeyString);
      // token generator function to generate access token and refresh token
      await newShop.save();
      return {
        code: "201",
        message: "Shop created successfully",
        data: { shop: _.pick(newShop, ["email", "_id", "name"]), tokens },
      };
    }
  };
  static refreshToken = async (refreshToken, device) => {
    try {
      const foundKeyTokenUsed = await KeyTokenService.findByRefreshTokenUsed(
        refreshToken
      );
      if (foundKeyTokenUsed) {
        let result = new Promise((resolve, reject) => {
          JWT.verify(
            refreshToken,
            foundKeyTokenUsed.publicKey,
            async (err, decoded) => {
              if (err) {
                reject(new ForbiddenError("Invalid refresh token"));
              }
              // handle case refreshtoken is used by someone else. it's stolen
              console.log("refresh token used");
              reject(new ForbiddenError("Refresh token is stolen"));
            }
          );
        });
        return result;
      } else {
        const foundKeyToken = await KeyTokenService.findByRefreshToken(
          refreshToken
        );

        if (!foundKeyToken) {
          throw new NotFoundError("Key token not found");
        }

        // return new Promise((resolve, reject) => {
        let result = new Promise((resolve, reject) => {
          JWT.verify(
            refreshToken,
            foundKeyToken.publicKey,
            async (err, decoded) => {
              if (err) {
                // remove the refresh token from refreshTokens array
                await KeyTokenService.deleteByKeyShop(
                  foundKeyToken,
                  refreshToken
                );
                reject(new ForbiddenError("refresh token is stolen"));
              }

              const shop = await shopSchema.findById(decoded.id).lean();
              if (!shop) {
                throw new NotFoundError("Shop not found");
              }
              const tokens = tokenGenerator(
                { id: shop._id, email: shop.email, roles: shop.roles, device },
                foundKeyToken.privateKey
              );

              // remove old refresh token in db
              //await KeyTokenService.deleteByKeyShop(foundKeyToken, refreshToken);
              //add new refresh token to refreshTokensused array
              await KeyTokenService.updateRefreshTokenUsed(
                foundKeyToken,
                refreshToken,
                device
              );
              console.log("update refresh token used");
              //add new refresh token to refreshTokens array
              await KeyTokenService.updateRefreshTokens(
                foundKeyToken,
                tokens.refreshToken,
                refreshToken,
                device
              );
              console.log("update refresh token");
              resolve({
                code: "200",
                message: "Refresh token successfully",
                data: {
                  shop: _.pick(shop, ["email", "roles", "name"]),
                  tokens,
                },
              });
            }
          );
        });
        return result;
      }
    } catch (error) {
      throw new ForbiddenError(error.message);
    }
  };
}
module.exports = AuthService;
