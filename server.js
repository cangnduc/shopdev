const express = require("express");
const app = express();
const dotenv = require("dotenv");
const morgan = require("morgan");
const compression = require("compression");
const path = require("path");
const cookieParser = require("cookie-parser");
dotenv.config();
const instanceMongodb = require("./database/mongodb.js");
const {
  app: { port },
} = require("./configs/configs.js");
const { checkOverload } = require("./helpers/check.connect.js");
const userSchema = require("./models/user.js");

//connect to database

//checkOverload();

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(morgan("dev"));
app.use(cookieParser()); // allow app to read cookies
//app.use(compression());

//routes
app.use("/api/v1", require("./routes/index.js"));

//error handler
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  //console.log("error", error);
  next(error);
});
app.use((error, req, res, next) => {
  console.log("error :: ", error);
 
  return res.status(error.status || 500).json({
    status: error.status || 500,
    message: error.message,
    code: error.code || "internal_server_error",
  });
});

//connect to database
instanceMongodb;

//run server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
