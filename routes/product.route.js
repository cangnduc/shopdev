const express = require("express");
const router = express.Router();
const {
  product,
  clothing,
  electronic,
  furniture,
} = require("../models/product.model");
const productController = require("../controllers/product.controller");
router.post("/", productController.createProduct);
router.get("/delete", async (req, res) => {
  await product.deleteMany({});
  await clothing.deleteMany({});
  await electronic.deleteMany({});
  await furniture.deleteMany({});
  res.json({
    message: "deleted product",
  });
});
module.exports = router;
