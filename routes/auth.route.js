const express = require("express");
const AuthController = require("../controllers/auth.controller.js");
const router = express.Router();
const { isApikey } = require("../services/apikey.service");
const { authentication } = require("../middlewares/authentication");

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.use(isApikey(["1111"]));
router.post("/logout", authentication, AuthController.logout);
router.get("/refreshtoken", AuthController.refreshToken);
router.get("/check", authentication, (req, res) => {
  res.json({
    message: "Welcome to Shopdev API",
  });
});
module.exports = router;
