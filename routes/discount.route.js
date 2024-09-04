const express = require("express");
const router = express.Router();
const DiscountController = require("../controllers/discount.controller");
const { authentication } = require("../middlewares/authentication");

router.get("/:shop", DiscountController.getDiscountCodeByShop);
router.get("/product/:code", DiscountController.getProductByDiscount);
router.use(authentication);
router.post("/", DiscountController.createDiscount);
router.post("/amount", DiscountController.getDiscountAmount);
module.exports = router;
