const { UnauthorizedError } = require("../helpers/errorResponse");
const { asyncHandler } = require("./asyncHandler");
const KeyStore = require("../services/keyToken.service");
const JWT = require("jsonwebtoken");
const authentication = asyncHandler(async (req, res, next) => {
  /* authentication middleware for logout
    1 - check shopId in the request
    2 - get access token from the request
    3- check if the token is valid
    4- check shopId in the token
    5- check if the shopId in the request is the same as the shopId in the keystore
    6 - if all is ok, call next
    */

  const shopID = req.headers["shop-id"];
  if (!shopID)
    throw new UnauthorizedError((message = "Shop ID is required to logout"));
  try {
    const keyShop = await KeyStore.findByShopId(shopID);
    if (!keyShop)
      throw new UnauthorizedError(
        (message = "Shop ID is not valid or not found")
      );
    const accessToken = req.headers["authorization"];
    const refreshToken = req.cookies.refreshToken;
    if (!accessToken)
      throw new UnauthorizedError(
        (message = "Access token is required to logout")
      );
    JWT.verify(
      accessToken,
      keyShop.publicKey,
      { algorithms: ["RS256"] },
      (err, decoded) => {
        if (err)
          throw new UnauthorizedError((message = "Access token is not valid"));
        if (decoded.id !== shopID)
          throw new UnauthorizedError((message = "Shop ID is not valid"));
        req.keyShop = keyShop;
        req.refreshToken = refreshToken;
        return next();
      }
    );
  } catch (error) {
    throw new UnauthorizedError((message = error?.message));
  }
});

module.exports = { authentication };
