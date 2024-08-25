const { model, Schema } = require("mongoose");
const cron = require("node-cron");
const keyTokenSchema = new Schema(
  {
    shop: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
    publicKey: { type: String, required: true },
    privateKey: { type: String, required: true },
    refreshTokenUsed: [
      {
        _id: { type: Schema.Types.ObjectId, ref: "refreshTokens" },
        token: { type: String, required: true },
        device: { type: String },
      },
    ],
    refreshTokens: [
      {
        token: { type: String, required: true },
        device: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);
// delete every minute
const schedule = "*/1 * * * *";
// cron.schedule("*/1 * * * *", async () => {
//   const now = new Date();
//   console.log("running a task every minute");
//   const sevenDaysAgo = new Date(now - 60 * 1000);
//   await keyTokenSchema.updateMany(
//     {},
//     {
//       $pull: {
//         refreshTokenUsed: { createdAt: { $lt: sevenDaysAgo } },
//         refreshTokens: { createdAt: { $lt: sevenDaysAgo } },
//       },
//     }
//   );
//   console.log("Cron Job: Delete expired tokens");
// });
module.exports = model("Key", keyTokenSchema);
