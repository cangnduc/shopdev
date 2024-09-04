const express = require("express");
const router = express.Router();
const {
  product,
  clothing,
  electronic,
  furniture,
} = require("../models/product.model");
const productController = require("../controllers/product.controller");
const DiscountController = require("../controllers/discount.controller");
const { authentication } = require("../middlewares/authentication");

router.get("/search/:keySearch", productController.searchProductByUser);
//make a router with query search
router.get("/searchs", productController.searchsProductByUser);
router.get("/", productController.getProductsByUser);
router.get("/:productID", productController.getProductById);

router.get("/delete", async (req, res) => {
  await product.deleteMany({});
  await clothing.deleteMany({});
  await electronic.deleteMany({});
  await furniture.deleteMany({});
  res.json({
    message: "deleted product",
  });
});
//router.get("/discount/:code", DiscountController.getPoroductByDiscount);
module.exports = router;
