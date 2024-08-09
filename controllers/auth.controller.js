"use strict";
const AuthService = require("../services/auth.service");
const SuccessResponse = require("../helpers/SuccessResponse");
const { wrapAsyncRoutes } = require("../middlewares/asyncHandler");
class AuthController {
  async register(req, res) {
    const result = await AuthService.register(req.body);

    new SuccessResponse({ ...result }).send(res);
  }
  async login(req, res) {
    const result = await AuthService.login(req.body);
    new SuccessResponse({ ...result }).send(res);
  }
  async logout(req, res) {
    const result = await AuthService.logout(req.keyShop);
    new SuccessResponse({ ...result }).send(res);
  }
  async refreshToken(req, res) {
    // get the refresh token from the cookie
    const refreshToken = req.cookies.refreshToken;
  
    const result = await AuthService.refreshToken(refreshToken);
    
    new SuccessResponse({ ...result }).send(res);
  }
}

module.exports = wrapAsyncRoutes(new AuthController());
