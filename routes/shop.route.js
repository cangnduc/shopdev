const express = require("express");
const { authentication } = require("../middlewares/authentication");
const productController = require("../controllers/product.controller");
const DiscountController = require("../controllers/discount.controller");

const router = express.Router();
router.get("/", (req, res) => {
  res.json({
    message: "Welcome to Shopdev API",
  });
});

router.get("/published", productController.getPublishedByShop);

router.use(authentication);

router.post("/", productController.createProduct);

router.get("/drafts", productController.getDraftsByShop);
router.patch("/:productID", productController.updateProduct);
router.put("/publish/:productID", productController.publishProduct);
router.put("/unpublish/:productID", productController.unPublishProduct);
router.put("/toggle/:productID", productController.toggleProduct);
module.exports = router;
