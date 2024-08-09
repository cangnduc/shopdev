const { db } = require("../models/shop.model");

const dev = {
  app: {
    port: process.env.DEV_APP_PORT || 4000,
  },
  db: {
    uri: process.env.DEV_DB_MONGO_URI,
  },
};

const production = {
  app: {
    port: process.env.PRO_APP_PORT || 5055,
  },

  db: {
    uri: process.env.PROD_DB_MONGO_URI,
  },
};
const config = { dev, production };
const env = process.env.NODE_ENV || "dev";

module.exports = config[env];
