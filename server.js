const express = require("express");
const app = express();
const dotenv = require("dotenv");
const morgan = require("morgan");
const compression = require("compression");
const path = require("path");
const cookieParser = require("cookie-parser");
dotenv.config();
//connect to redis
const instanceRedis = require("./database/redis.js");

const instanceMongodb = require("./database/mongodb.js");
const {
  app: { port },
} = require("./configs/configs.js");
const { checkOverload } = require("./helpers/check.connect.js");

//connect to database

//checkOverload();

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(morgan("dev"));
app.use(cookieParser()); // allow app to read cookies
//app.use(compression());
app.get("/", async (req, res) => {
  //define a sample redis key value
  const key =
    "refreshToken:eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YmYxNDMxNWQ2MDg5MzBhNDViOTYwNSIsImVtYWlsIjoid29ya2luZ2F0Z2VtczFAZ21haWwuY29tIiwicm9sZSI6WyJzaG9wIl0sImlhdCI6MTcyMzk1ODc0NiwiZXhwIjoxNzI0NTYzNTQ2fQ.eIPIRtlgfYOW9_kRKF0XhBpGjnWoe2O8CfQ8Aw2r6BtJPehBeU0XpsX3UMQnKD6QSmEBYewXZ_xa5NAVrC7X7DmNFyXKyW7WiNgAMz_66NrtpQr_cvopjgjq7c4DHII2RCwc5X0kwPlj1-JvsQCXptxY53w_gF3H_RO1XwUrA9_nR_iC053ljvwbVqFyehXD4woaooe1lXZq3FicBG8ZwEzQWODl7x7qFqTicw_3pi1Ewb_NiQXzoZ6-vizdlg83QmpHrly-aQmK03r4jOYdoZl2zQ5NLREIrv4nTr9Z2IZvMVhzst1tLZjpdKzWlcg_MvcyCIVfCeLJGwf6GpXxU5J5doEfYLyXw27KEMtKgTnuCZrgbyh5LGC26LfkX8WUh34cyql0grVsymkl0EoLS_9I9cWEAkq7sEBftQmUkOU2JIlUpjA49T6OSO4MbdUdmnn_vohDvC74ytv52b7iQkZqHv0_FZAbb_7XWEB7dFlAnk-luzZXW6C0b7CZ4yN-UV6gu5xYw4sLKZjpGT_l10vZYtPPFHZmtE9zBq5kS2nd0eAlEefX9n4ItPXUJAOrbKq5VA2C6cfqoLWyGxP55H0lof2-9CU34tivwDOW6rM9t6GTaGKn1EB1wdpWgzH4Qq85RU8rLNhginwx0vczSNVsdcdcVo9BpJS_FwcLxHY";

  //delete the key
  await instanceRedis.del(key);

  res.json({ message: "deleted ok" });
});
//routes
app.use("/api/v1", require("./routes/index.js"));

//error handler
app.use((req, res, next) => {
  const error = new Error("Link Not found");
  error.status = 404;
  //console.log("error", error);
  next(error);
});
app.use((error, req, res, next) => {
  console.log("error :: ", error);

  return res.status(error.code || 500).json({
    status: error.status || "internal_server_error",
    message: error.message,
    code: error.code || 500,
  });
});

//connect to database
instanceMongodb;
instanceRedis;
//run server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
