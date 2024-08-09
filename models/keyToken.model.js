const { model, Schema } = require("mongoose");

const keyTokenSchema = new Schema({
    shop: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
    publicKey: { type: String, required: true },
    privateKey: { type: String, required: true },
    refreshTokenUsed: { type: Array, default: [] },
    refreshToken: { type: String, required: true }, 
},
{
    timestamps: true,
    
});


module.exports = model("Key", keyTokenSchema);