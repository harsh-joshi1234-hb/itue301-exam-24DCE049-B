const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  id: { type: Number },
  itemName: { type: String, required: true },
  qty: { type: Number, required: true, min: 1, max: 10, default: 1 },
  weightG: { type: Number, required: true, min: 1, default: 100 },
  kcal: { type: Number, required: true },
  customerName: { type: String, default: "Guest" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
