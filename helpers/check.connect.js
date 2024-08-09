"use strict";
const os = require("os");
const process = require("process");
const mongoose = require("mongoose");

const countConnect = () => {
  const numConnection = mongoose.connections.length;
  console.log(`Number of connection: ${numConnection}`);
};

const checkOverload = () => {
  setInterval(() => {
    const numConnection = mongoose.connections.length;
    const numCores = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;
    const maxConnection = numCores * 5;
    console.log(`NumCores:: ${numCores}`)
    console.log(`Active connection: ${numConnection}`)
    console.log(`Memory usage:: ${memoryUsage / 1024/1024} MB`)
    if(numConnection > maxConnection) {
        console.log("Connection Overload Detected")
    }
  }, 5000);
};

module.exports = {countConnect, checkOverload};
