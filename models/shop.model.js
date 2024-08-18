"use strict";

const { model, Schema, Types } = require("mongoose");

const documentName = "Shop";
const collectionName = "shops";

const shopSchema = new Schema(
  {
    name: { type: String, trim: true, maxLength: 150 },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "inactive" },
    verfify: {
      type: Schema.Types.Boolean,
      default: false,
    },
    confirmCode: {
      type: String,
    },
    confirmCodeExpires: {
      type: Date,
    },
    roles: {
      type: Array,
      default: [],
    },
    //customAttributes: { type: Schema.Types.Mixed }, // Flexible field for custom attributes
  },
  {
    timestamps: true,
  }
);
module.exports = model(documentName, shopSchema);
