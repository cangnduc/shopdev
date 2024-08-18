const { model, Schema } = require("mongoose");

const keyTokenSchema = new Schema(
  {
    shop: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
    publicKey: { type: String, required: true },
    privateKey: { type: String, required: true },
    refreshTokenUsed: [
      {
        token: { type: String, required: true },
        device: { type: String },
        createAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 7 },
      },
    ],
    refreshTokens: [
      {
        token: { type: String, required: true },
        device: { type: String },
        createdAt: { type: Date, default: Date.now },
        expires: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 7 }, // 7 days
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = model("Key", keyTokenSchema);
