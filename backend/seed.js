const connect = require("./db");
const MenuItem = require("./models/MenuItem");
const Order = require("./models/Order");
const { formatValidationError } = require("./utils/formatError");

(async () => {
  try {
    await connect();

    // 1. Save valid menu items
    const sampleItems = [
      { name: "Samosa", price: 15, category: "snack", available: true, caloriesPer100g: 260, weightG: 60 },
      { name: "Masala Chai", price: 10, category: "drink", available: true, caloriesPer100g: 50, weightG: 150 },
      { name: "Veg Thali", price: 80, category: "meal", available: true, caloriesPer100g: 150, weightG: 400 },
      { name: "Cold Coffee", price: 40, category: "drink", available: false, caloriesPer100g: 70, weightG: 250 },
      { name: "Masala Dosa", price: 60, category: "snack", available: true, caloriesPer100g: 180, weightG: 150 },
    ];

    for (const item of sampleItems) {
      await MenuItem.findOneAndUpdate({ name: item.name }, item, { upsert: true, new: true });
    }

    const saved = await MenuItem.findOne({ name: "Masala Dosa" });
    console.log("Successfully saved valid menu item into MongoDB 'menuitems':");
    console.log(JSON.stringify(saved, null, 2));

    // Also ensure initial orders exist in MongoDB 'orders'
    await Order.findOneAndUpdate(
      { id: 1 },
      { id: 1, itemName: "Samosa", qty: 2, weightG: 60, kcal: 312, customerName: "Harsh" },
      { upsert: true }
    );
    await Order.findOneAndUpdate(
      { id: 2 },
      { id: 2, itemName: "Masala Chai", qty: 1, weightG: 150, kcal: 75, customerName: "Harsh" },
      { upsert: true }
    );
    console.log("Seeded active orders into MongoDB 'orders' collection.");

    // 2. Demonstrate how an invalid menu item is reported with formatValidationError
    const invalidItem = new MenuItem({
      name: "Super Jumbo Canteen Beverage That Has Way More Than Fifty Characters In Its Name",
      price: -20,
      category: "drink",
      caloriesPer100g: 1050,
      weightG: 750, // exceeds max 500g for drinks
    });

    try {
      await invalidItem.validate();
    } catch (err) {
      const formatted = formatValidationError(err);
      console.log("\nFormatted validation error for invalid item:");
      console.log(JSON.stringify(formatted, null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error("Error in seed script:", error);
    process.exit(1);
  }
})();
