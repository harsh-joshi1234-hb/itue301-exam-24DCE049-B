const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is required"],
    trim: true,
    maxlength: [50, "name must be at most 50 characters"],
  },
  price: {
    type: Number,
    required: [true, "price is required"],
    min: [0, "price cannot be negative"],
  },
  category: {
    type: String,
    enum: ["snack", "meal", "drink"],
    default: "snack",
  },
  available: {
    type: Boolean,
    default: true,
  },
  caloriesPer100g: {
    type: Number,
    required: [true, "caloriesPer100g is required"],
    min: [0, "caloriesPer100g cannot be negative"],
    max: [900, "caloriesPer100g cannot exceed 900"],
  },
  weightG: {
    type: Number,
    default: 100,
    min: [1, "weightG must be at least 1"],
    max: [2000, "weightG cannot exceed 2000"],
    validate: {
      validator: function (v) {
        return this.category !== "drink" || v <= 500;
      },
      message: "A drink cannot weigh more than 500 g",
    },
  },
});

module.exports = mongoose.model("MenuItem", menuItemSchema);
