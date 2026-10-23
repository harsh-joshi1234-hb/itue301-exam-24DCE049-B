import { useEffect, useState, useCallback } from "react";

const URL = "https://jsonplaceholder.typicode.com/todos?_limit=10";

// Appropriate canteen delicacy names mapped to the 10 daily specials
const CANTEEN_SPECIAL_NAMES = {
  1: "Chef's Special Pav Bhaji",
  2: "Crispy Paneer Pakoda",
  3: "Mysore Masala Dosa",
  4: "Schezwan Hakka Noodles",
  5: "Chole Bhature Combo",
  6: "Veggie Supreme Cheese Burger",
  7: "Mumbai Vada Pav Duo",
  8: "Cold Coffee with Vanilla Float",
  9: "Fresh Mango Kesar Lassi",
  10: "Hot Gulab Jamun with Rabdi",
};

export default function SpecialsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSpecials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(URL);
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      const todos = await res.json();
      setData(todos);
    } catch (err) {
      setError(err?.message || "Could not load specials");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpecials();
  }, [fetchSpecials]);

  if (loading) {
    return (
      <main className="specials-page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading specials…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="specials-page-container">
        <div className="error-card card-box">
          <p role="alert" className="error-text">Could not load specials</p>
          <button onClick={fetchSpecials} className="btn btn-submit" type="button">
            🔄 Retry
          </button>
        </div>
      </main>
    );
  }

  const availableCount = data.filter((item) => !item.completed).length;
  const totalCount = data.length;

  const sortedData = [
    ...data.filter((item) => !item.completed),
    ...data.filter((item) => item.completed),
  ];

  return (
    <main className="specials-page-container">
      <div className="page-header">
        <div>
          <h2>Today's Specials</h2>
          <p className="subtitle">Chef's hand-crafted daily specials served hot and fresh.</p>
        </div>
        <div className="availability-pill">
          <span className="live-dot"></span>
          <span className="count-label">{availableCount} of {totalCount} available</span>
        </div>
      </div>

      <div className="specials-grid">
        {sortedData.map((t) => (
          <div key={t.id} className={`special-card ${t.completed ? "card-completed" : "card-open"}`}>
            <div className="special-content">
              <span className="special-number">#{t.id}</span>
              <div className="special-details">
                <strong className="special-title">{CANTEEN_SPECIAL_NAMES[t.id] || t.title}</strong>
                <span className="special-subtitle">Special #{t.id} • {t.title}</span>
              </div>
            </div>
            <span className={`badge ${t.completed ? "badge-soldout" : "badge-available"}`}>
              {t.completed ? "Sold out" : "Available"}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}
