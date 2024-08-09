
const { model, Schema } = require("mongoose");


const apikeySchema = new Schema(
  {
   key: { type: String, required: true , unique: true},
   status: { type: Boolean , default: true},
   permissions: {type: [String], required: true, enum: ["0000", "1111", "2222"]}
  },
  {
    collection: "apikeys",
    timestamps: true,
  }
);

module.exports = model("apikey", apikeySchema);
