const express = require("express");
const mongoose = require("mongoose");
const app = express();

// Request logger: [METHOD] [PATH] [TIMESTAMP]
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path} [${new Date().toISOString()}]`);
  next();
});

// CORS support for frontend integration
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// JSON body parser must be mounted before route handlers
app.use(express.json());

// Energy content (kcal per 100 g) of every item the canteen serves
const MENU = { "Samosa": 260, "Masala Chai": 50, "Veg Thali": 150, "Cold Coffee": 70 };

let orders = [
  { id: 1, itemName: "Samosa", qty: 2, weightG: 60, kcal: 312 },
  { id: 2, itemName: "Masala Chai", qty: 1, weightG: 150, kcal: 75 },
];
let nextId = 3;

app.get("/api/v1/orders", (req, res) => {
  res.status(200).json(orders);
});

app.get("/api/v1/orders/:id", (req, res) => {
  const order = orders.find((o) => o.id === Number(req.params.id));
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.status(200).json(order);
});

app.post("/api/v1/orders", (req, res) => {
  const { itemName, customerName } = req.body || {};
  let { qty, weightG } = req.body || {};

  if (!itemName || !(itemName in MENU)) {
    return res.status(400).json({ error: "Invalid or missing itemName" });
  }

  if (qty === undefined) {
    qty = 1;
  } else if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
    return res.status(400).json({ error: "qty must be a whole number from 1 to 10" });
  }

  if (weightG === undefined) {
    weightG = 100;
  } else if (typeof weightG !== "number" || isNaN(weightG) || weightG <= 0) {
    return res.status(400).json({ error: "weightG must be a number above 0" });
  }

  const kcal = Math.round(((MENU[itemName] * weightG) / 100) * qty);
  const order = { id: nextId++, itemName, qty, weightG, kcal };
  orders.push(order);

  // If MongoDB is connected, persist order into MongoDB collection 'orders'
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const Order = require("./models/Order");
      Order.create({
        id: order.id,
        itemName: order.itemName,
        qty: order.qty,
        weightG: order.weightG,
        kcal: order.kcal,
        customerName: customerName || "Student",
      }).catch((err) => console.error("MongoDB order save notice:", err.message));
    } catch (err) {
      console.error("MongoDB save error:", err.message);
    }
  }

  res.status(201).json(order);
});

app.delete("/api/v1/orders/:id", (req, res) => {
  const index = orders.findIndex((o) => o.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Order not found" });
  const [deleted] = orders.splice(index, 1);

  // Remove from MongoDB as well if connected
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const Order = require("./models/Order");
      Order.deleteOne({ id: Number(req.params.id) }).catch(() => {});
    } catch {}
  }

  res.status(200).json({ message: "Order deleted", order: deleted });
});

// Diagnostic route used to test the error handler. Leave it in place.
app.get("/api/v1/boom", () => {
  throw new Error("Kitchen is on fire");
});

// Global error handler
// Note: Express error handlers require 4 parameters (err, req, res, next)
app.use((err, req, res, next) => {
  res.status(500).json({ error: "Something went wrong" });
});

module.exports = app;
