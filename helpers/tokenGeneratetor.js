"use strict";
const keyTokenSchema = require("../models/keyToken.model");
const jwt = require("jsonwebtoken");
const tokenGenerator = (payload, privateKey) => {
  try {
    const accessToken = jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "1d",
    });
    const refreshToken = jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "7d",
    });

    return { accessToken, refreshToken };
  } catch (error) {
    return {
      code: "404",
      message: error.message,
    };
  }
};
const saveRefreshToken = async (shopId, refreshToken, device) => {
  const shopKey = await keyTokenSchema.findOne({ shop: shopId });
  if (shopKey) {
    shopKey.refreshTokens.push({ token: refreshToken, device: device });
    await shopKey.save();
  }
  await shopKey.save();
};

module.exports = tokenGenerator;
