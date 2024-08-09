const apikeySchema = require("../models/apikey.model");
const isApikey = (permissions) => {
  return async (req, res, next) => {
    const apikey = req.headers["x-api-key"];

    if (apikey) {
      const apikeyDB = await apikeySchema.findOne({ key: apikey, status: true });
      //console.log(apikeyDB)
      if (apikeyDB) {
        //console.log(permissions.includes(apikeyDB.permissions))
        if (permissions.every((permission) => apikeyDB.permissions.includes(permission))) {
          req.apikey = apikeyDB;
          return next();
        } else {
          return res.status(403).json({ code: "403", message: "Unauthorized" });
        }
      } else {
        return res.status(403).json({ code: "403", message: "Unauthorized" });
      }
    } else {
      return res.status(403).json({ code: "403", message: "Unauthorized" });
    }
  };
};

module.exports = { isApikey };
