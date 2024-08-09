"use strict";
const shopSchema = require("../models/shop.model");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const bcrypt = require("bcryptjs");
const tokenGenerator = require("../helpers/tokenGeneratetor");
const _ = require("lodash");
const JWT = require("jsonwebtoken");
const { ErorrResponse, NotFoundError, ForbiddenError } = require("../helpers/errorResponse");
const RolesShop = {
  SHOP: "shop",
  WRITER: "writer",
  ADMIN: "admin",
  EDITOR: "editor",
};
class AuthService {
  static logout = async (keyShop) => {
    const result = await KeyTokenService.deleteByShopId(keyShop._id);
    if (!result) throw new ErorrResponse("Error in logout");
    return { code: "200", message: "Logout successfully", result };
  };
  static login = async ({ email, password, refreshToken = {} }) => {
    const shop = await shopSchema.findOne({ email }).select({ email: 1, _id: 1, roles: 1, name: 1, password: 1 }).lean();

    if (!shop) {
      console.log("Shop not found");
      throw new NotFoundError("Shop not found");
    }

    const isMatch = await bcrypt.compare(password, shop.password);
    if (!isMatch) {
      throw new ErorrResponse("Invalid password");
    }
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
    // generate access token and refresh token
    const tokens = tokenGenerator({ id: shop._id, email: shop.email, role: shop.roles }, publicKey, privateKey);

    // generate public key string and save {userId, publicKey} in keytoken collection
    const publicKeyString = await KeyTokenService.generateKeyToken({ shopId: shop._id, publicKey, privateKey, refreshToken: tokens.refreshToken });
    if (!publicKeyString) {
      throw new ErorrResponse("Error generating key token");
    }

    return { code: "200", message: "Login successfully", data: { shop: _.pick(shop, ["email", "roles", "name"]), tokens } };
  };
  static register = async ({ name, email, password }) => {
    const holderShop = await shopSchema.findOne({ email }).lean();

    if (holderShop) {
      throw new ErorrResponse("Email already exists");
    }
    const hassedPassword = await bcrypt.hash(password, 10);

    const newShop = await shopSchema.create({ name, email, password: hassedPassword, roles: [RolesShop.SHOP] });

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
      const tokens = tokenGenerator({ id: newShop._id, email: newShop.email, roles: newShop.roles }, publicKey, privateKey);
      // generate public key string and save {userId, publicKey} in keytoken collection
      const publicKeyString = await KeyTokenService.generateKeyToken({ shopId: newShop._id, publicKey, privateKey, refreshToken: tokens.refreshToken });

      if (!publicKeyString) {
        throw new ErorrResponse("Error generating key token");
      }
      // convert public key string to public key object
      //const publicKeyObject = crypto.createPublicKey(publicKeyString);
      // token generator function to generate access token and refresh token

      return { code: "201", message: "Shop created successfully", data: { shop: _.pick(newShop, ["email", "_id", "name"]), tokens } };
    }
  };
  static refreshToken = async (refreshToken) => {
    /*
    1/ check if the refresh token is used
    */
    try {
      const refreshTokenUsedKey = await KeyTokenService.findByRefreshTokenUsed(refreshToken);
      if (refreshTokenUsedKey) {
        JWT.verify(refreshToken, refreshTokenUsedKey.publicKey, { algorithms: ["RS256"] }, async (err, decoded) => {
          if (err) {
            throw new ForbiddenError("Refresh token is not valid 1");
          }

          await KeyTokenService.deleteByShopId(refreshTokenUsedKey._id);
          //throw an error here but app crashs
         
        });
         throw new ForbiddenError("Refresh token is used");
      }

      const shopKey = await KeyTokenService.findByRefreshToken(refreshToken);
      if (!shopKey) {
        throw new NotFoundError("You are not login or refresh token is not found");
      }
      const decoded = await new Promise((resolve, reject) => {
        JWT.verify(refreshToken, shopKey.publicKey, { algorithms: ["RS256"] }, (err, decoded) => {
          if (err) {
            return reject(new ForbiddenError("Refresh token is not valid 1"));
          }
          resolve(decoded);
        });
      });

      const foundShop = await shopSchema.findById(decoded.id).lean();
      if (!foundShop) {
        throw new NotFoundError("Shop not found");
      }
      console.log("foundShop", foundShop);
      const tokens = tokenGenerator({ id: foundShop._id, email: foundShop.email, role: foundShop.roles }, shopKey.publicKey, shopKey.privateKey);
      // update the shopkey with new refresh token and add refresh token to used refresh token
      shopKey.refreshTokenUsed.push(refreshToken);
      shopKey.refreshToken = tokens.refreshToken;
      await shopKey.save();
      return { code: "200", message: "Refresh token successfully", data: { shop: _.pick(foundShop, ["email", "roles", "name"]), tokens } };
    } catch (error) {
      throw new ForbiddenError(error.message);
    }
  };
}
module.exports = AuthService;
