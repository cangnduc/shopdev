const { createClient } = require("redis");
const dotenv = require("dotenv");
dotenv.config();

const client = createClient({
  password: process.env.REDIS_PASSWORD || "dZzienfdoy3g8vmBYPeNVAsK33EqYA8B",
  socket: {
    host:
      process.env.REDIS_HOST ||
      "redis-11351.c62.us-east-1-4.ec2.redns.redis-cloud.com",
    port: process.env.REDIS_PORT || 11351,
  },
});

// client.on("connect", () => {
//   console.log("Redis connected");
// });

// client.on("error", (error) => {
//   console.error("Error connecting to redis: ", error);
// });

(async () => {
  try {
    await client.connect();
    console.log("Redis Client connected successfully");
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
})();

module.exports = client;
