const express = require("express");
const apikeySchema = require("../models/apikey.model.js");
const keyTokenSchema = require("../models/keytoken.model.js");
const userSchema = require("../models/user.js");
const shopSchema = require("../models/shop.model.js");
const router = express.Router();
const { authentication } = require("../middlewares/authentication");
const { asyncHandler } = require("../middlewares/asyncHandler.js");
router.use("/auth", require("./auth.route.js"));
router.use("/shop", authentication, require("./shop.route.js"));
router.get("/", async (req, res) => {
  res.json({
    message: "Welcome to Shopdev API",
  });
});
router.get(
  "/error",
  asyncHandler(async (req, res, next) => {
    a;
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
  if (!apikeys || !keyTokens || !users) {
    return res.status(400).json({
      message: "Error deleting apikeys, keyTokens or users",
    });
  }
  res.json({
    apikeys,
    message: "All apikeys deleted",
  });
});

module.exports = router;
