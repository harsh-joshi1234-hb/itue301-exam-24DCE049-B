require("dotenv").config();
const app = require("./app");
const connect = require("./db");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connect();
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
  }

  app.listen(PORT, () => console.log(`Canteen API running on port ${PORT}`));
})();
