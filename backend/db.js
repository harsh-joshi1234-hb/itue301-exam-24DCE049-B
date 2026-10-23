require("dotenv").config();
const mongoose = require("mongoose");

module.exports = async function connect() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/canteen";
  await mongoose.connect(uri, { dbName: "canteen" });
  console.log(`MongoDB connected to database: ${mongoose.connection.name}`);
};
