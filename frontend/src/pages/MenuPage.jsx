import MenuCard from "../components/MenuCard";
import { menu } from "../data/menu";

export default function MenuPage() {
  return (
    <main className="menu-page-container">
      <div className="page-header">
        <h2>Canteen Menu</h2>
        <p className="subtitle">Fresh, nutritious, and delicious campus meals prepared daily.</p>
      </div>

      <div className="grid">
        {menu.map((item) => (
          <MenuCard
            key={item.id}
            name={item.name}
            price={item.price}
            category={item.category}
            available={item.available}
            caloriesPer100g={item.caloriesPer100g}
            weightG={item.weightG}
          />
        ))}
      </div>
    </main>
  );
}
