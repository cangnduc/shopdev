"use strict";
const jwt = require("jsonwebtoken");
const tokenGenerator = (payload, publicKey, privateKey) => {
  try {
    const accessToken = jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "7d",
    });
    const refreshToken = jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "14d",
    });
    // jwt.verify(accessToken, publicKey, { algorithms: ["RS256"] }, (err, decoded) => {
    //     if(err) {
    //         console.log(err);
    //     }
    //     console.log(decoded);
    // });
    return { accessToken, refreshToken };
  } catch (error) {
    return {
      code: "404",

      message: error.message,
    };
  }
};

module.exports = tokenGenerator;
// add here
