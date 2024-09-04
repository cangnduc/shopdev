const { model, Schema } = require("mongoose");

const inventorySchema = new Schema(
  {
    inven_product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    inven_stock: { type: Number, required: true },
    inven_shop: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
    inven_reservations: { type: Array, default: [] },
  },
  { timestamps: true, collection: "inventories" }
);

module.exports = {
  inventory: model("Inventory", inventorySchema),
};
//   return result;
