import { kcal, weightOf } from "../utils/nutrition";

export default function MenuCard({
  name,
  title,
  price,
  cost,
  category,
  available,
  caloriesPer100g,
  weightG,
}) {
  const itemName = name || title || "";
  const itemPrice = price !== undefined ? price : cost !== undefined ? cost : 0;
  const itemWeight = weightOf({ weightG });
  const itemKcal = kcal({ caloriesPer100g, weightG });

  const categoryColorMap = {
    snack: "badge-snack",
    meal: "badge-meal",
    drink: "badge-drink",
  };

  return (
    <div className={`card ${!available ? "card-unavailable" : ""}`}>
      <div className="card-top-row">
        <span className={`category-tag ${categoryColorMap[category?.toLowerCase()] || "badge-snack"}`}>
          {category}
        </span>
        <span className={`badge ${available ? "badge-available" : "badge-soldout"}`}>
          {available ? "Available" : "Not Available"}
        </span>
      </div>

      <h3 className="card-title">{itemName}</h3>

      <div className="card-specs">
        <span className="spec-item portion-spec">⚖️ {itemWeight} g</span>
        <span className="spec-item energy-spec">🔥 {itemKcal} kcal</span>
      </div>

      <div className="card-footer">
        <span className="price">₹{Number(itemPrice).toFixed(2)}</span>
      </div>
    </div>
  );
}
