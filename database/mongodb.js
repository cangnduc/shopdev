const mongoose = require("mongoose");
const {
  db: { uri },
} = require("../configs/configs");
const connectionString = uri;

class Database {
  constructor() {
    this.connect();
  }

  connect(type = "mongodb") {
    // if(1===1) {
    //     mongoose.set("debug", (collectionName, method, query, doc) => {
    //         console.log(`${collectionName}.${method}`, JSON.stringify(query), doc);
    //     });
    //     //mongoose.set("debug", { color: true });
    // }
    if(type === "mongodb") {
    mongoose
      .connect(connectionString)
      .then(() => {
        console.log("Database connection successful");
      })
      .catch((err) => {
        console.error("Database connection error");
      });}

    // if(type === "mysql") {}
  }
  static getInstance() {
    if (!this.instance) {
      this.instance = new Database();
    }
    return this.instance;
  }
}

const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;
