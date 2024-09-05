const express = require("express");
const router = express.Router();
const CartController = require("../controllers/cart.controller");
const { authentication } = require("../middlewares/authentication");

router.use(authentication);
router.get("/", CartController.getCartByUserID);
router.post("/", CartController.addProductToCart);
router.put("/", CartController.updateItemInCart);
module.exports = router;
