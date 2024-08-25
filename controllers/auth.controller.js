"use strict";
const AuthService = require("../services/auth.service");
const SuccessResponse = require("../helpers/SuccessResponse");
const { wrapAsyncRoutes } = require("../middlewares/asyncHandler");
const crypto = require("crypto");
class AuthController {
  async register(req, res) {
    let device = req.ua;
    device = device?.os?.name;

    const result = await AuthService.register({ ...req.body, device });

    new SuccessResponse({ ...result }).send(res);
  }
  async login(req, res) {
    //set the device id to local storage
    let device = req.ua;
    device = device?.os?.name;
    const result = await AuthService.login({ ...req.body, device });

    new SuccessResponse({ ...result }).send(res);
  }
  async logout(req, res) {
    const device = req.ua;
    const result = await AuthService.logout(
      req.keyShop,
      req.refreshToken,
      device
    );
    new SuccessResponse({ ...result }).send(res);
  }
  async refreshToken(req, res) {
    // get the refresh token from the cookie
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new ForbiddenError("Refresh token is required");
    } else {
      let device = req.ua;
      device = device?.os?.name;
      const result = await AuthService.refreshToken(refreshToken, device);
      new SuccessResponse({ ...result }).send(res);
    }
  }
  async genShopKey(req, res) {
    let device = req.ua;
    device = device?.os?.name;
    const result = await AuthService.genShopKey(
      "workingatgems@gmail.com",
      device
    );
    new SuccessResponse({ ...result }).send(res);
  }
  async verify(req, res) {
    let device = req.ua;
    device = device?.os?.name;
    const { email, code } = req.body;
    if (!email || !code) {
      throw new ForbiddenError("Email and code are required");
    }
    const result = await AuthService.verify(email, code, device);
    new SuccessResponse({ ...result }).send(res);
  }
}

module.exports = wrapAsyncRoutes(new AuthController());
