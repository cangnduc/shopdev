const express = require("express");
const { isApikey } = require("../services/apikey.service");
const router = express.Router();
//router.use(isApikey(["1111", "2222"]));
router.get("/", (req, res) => {
  res.json({
    message: "Welcome to Shopdev API",
  });
});
router.use("/product", require("./product.route"));
module.exports = router;
