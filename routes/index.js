const express = require("express");
const apikeySchema = require("../models/apikey.model.js");
const keyTokenSchema = require("../models/keyToken.model.js");
const userSchema = require("../models/user.js");
const shopSchema = require("../models/shop.model.js");
const router = express.Router();
const redisClient = require("../database/redis");
const uaparser = require("../middlewares/uaparser");
const { asyncHandler } = require("../middlewares/asyncHandler.js");
router.use("/auth", uaparser, require("./auth.route.js"));
router.use("/shop", require("./shop.route.js"));

router.get("/", async (req, res) => {
  const userAgent = req.headers["user-agent"];
  let parserResult = new UAParser(userAgent);
  console.log(parserResult);
  return res.json(parserResult.getResult());
});

router.get(
  "/error",
  asyncHandler(async (req, res, next) => {
    const apikeys = await apikeySchema.create({
      key: "123456",
      status: true,
      permissions: ["1111"],
    });
    res.json({
      apikeys,
      message: "Welcome to Shopdev API",
    });
  })
);
router.get("/delete", async (req, res) => {
  //const apikeys = await apikeySchema.deleteMany({});
  const keyTokens = await keyTokenSchema.deleteMany({});
  const users = await userSchema.deleteMany({});
  await shopSchema.deleteMany({});
  // delete all keys in redis
  await redisClient.flushAll();
  if (!keyTokens || !users) {
    return res.status(400).json({
      message: "Error deleting apikeys, keyTokens or users",
    });
  }
  res.json({
    message: "All apikeys deleted",
  });
});

module.exports = router;
