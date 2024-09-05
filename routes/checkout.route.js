const express = require("express");
const router = express.Router();
const CheckoutController = require("../controllers/checkout.controller");
const { authentication } = require("../middlewares/authentication");

router.use(authentication);
router.post("/", CheckoutController.reviewCheckout);

module.exports = router;
