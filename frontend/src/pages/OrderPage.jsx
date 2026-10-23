import { useState, useEffect, useCallback } from "react";
import { menu } from "../data/menu";
import { kcal } from "../utils/nutrition";

export default function OrderPage() {
  const [cart, setCart] = useState([]);
  const [name, setName] = useState("");
  const [calorieMessage, setCalorieMessage] = useState("");
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrders, setPlacedOrders] = useState([]);

  // Task 2: All three derived sums over cart lines, never kept in separate state
  const totalCount = cart.length;
  const totalPrice = cart.reduce((sum, item) => sum + Number(item.price), 0);
  const totalEnergy = cart.reduce((sum, item) => sum + kcal(item), 0);

  // Load existing orders from backend API
  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/orders");
      if (res.ok) {
        const data = await res.json();
        setPlacedOrders(data);
      }
    } catch {
      // Backend optional poll
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const addItem = (item) => {
    if (!item.available) return;

    const itemKcal = kcal(item);
    if (totalEnergy + itemKcal > 1000) {
      setCalorieMessage("Calorie limit of 1000 kcal exceeded");
      return;
    }

    setCalorieMessage("");
    setSubmitStatus(null);
    setCart((prevCart) => [...prevCart, item]);
  };

  const removeItem = (indexToRemove) => {
    setCart((prevCart) => prevCart.filter((_, idx) => idx !== indexToRemove));
    setCalorieMessage("");
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setSubmitStatus({ error: "Please enter your name before placing the order." });
      return;
    }
    if (cart.length === 0) {
      setSubmitStatus({ error: "Your cart is empty. Add at least one item." });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Submit each item in the cart to the backend API
      const createdIds = [];
      for (const item of cart) {
        const payload = {
          itemName: item.name,
          qty: 1,
          weightG: item.weightG || 100,
          customerName: name.trim(),
        };

        const res = await fetch("/api/v1/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to submit order");
        }
        const created = await res.json();
        createdIds.push(created.id);
      }

      setSubmitStatus({
        success: `Order placed successfully for ${name}! Order ID(s): #${createdIds.join(", #")}. Total: ₹${totalPrice.toFixed(2)} (${totalEnergy} kcal).`,
      });
      setCart([]);
      loadOrders();
    } catch (err) {
      setSubmitStatus({ error: err.message || "Failed to place order. Ensure backend is running." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const res = await fetch(`/api/v1/orders/${orderId}`, { method: "DELETE" });
      if (res.ok) {
        loadOrders();
      }
    } catch {
      // ignore
    }
  };

  return (
    <main className="order-page-container">
      <div className="page-header">
        <h2>Place an Order</h2>
        <p className="subtitle">Select your favourite canteen delicacies and pre-order in seconds.</p>
      </div>

      <div className="order-layout">
        <div className="order-left-column">
          {/* Customer Input */}
          <div className="card-box customer-box">
            <label htmlFor="customer-name" className="input-label">Customer Name</label>
            <input
              id="customer-name"
              className="text-input"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="order-target">Order for: {name}</p>
          </div>

          {/* Calorie Limit Alert */}
          {calorieMessage && (
            <div className="alert-badge alert-error" role="alert">
              ⚠️ {calorieMessage}
            </div>
          )}

          {/* Quick Add Menu Items */}
          <div className="card-box menu-selection-box">
            <h3>Available Items</h3>
            <p className="hint">Click an item below to add it to your order:</p>
            <div className="menu-actions">
              {menu
                .filter((i) => i.available)
                .map((item) => (
                  <button
                    key={item.id}
                    className="btn btn-add"
                    onClick={() => addItem(item)}
                    type="button"
                  >
                    + Add {item.name}
                    <span className="btn-subtext">₹{item.price.toFixed(2)} • {kcal(item)} kcal</span>
                  </button>
                ))}
            </div>
          </div>
        </div>

        <div className="order-right-column">
          {/* Cart & Totals Summary */}
          <div className="card-box cart-summary-box">
            <h3>Your Order Cart</h3>

            <div className="cart-summary">
              <div className="summary-item">
                <span className="summary-label">Items in cart:</span>
                <span className="summary-val">{totalCount}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total price:</span>
                <span className="summary-val price-highlight">₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total energy:</span>
                <span className="summary-val kcal-highlight">{totalEnergy} kcal</span>
              </div>
            </div>

            {/* Calorie Meter */}
            <div className="calorie-meter">
              <div className="calorie-bar-container">
                <div
                  className={`calorie-bar ${totalEnergy > 800 ? "bar-warning" : ""}`}
                  style={{ width: `${Math.min((totalEnergy / 1000) * 100, 100)}%` }}
                />
              </div>
              <span className="calorie-meter-text">{totalEnergy} / 1000 kcal maximum</span>
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <p className="empty-cart-msg">Your cart is empty. Add items from the menu.</p>
            ) : (
              <ul className="cart-list">
                {cart.map((item, index) => (
                  <li key={index} className="cart-line-item">
                    <div className="item-info">
                      <strong className="item-name">{item.name}</strong>
                      <span className="item-specs">₹{Number(item.price).toFixed(2)} - {kcal(item)} kcal</span>
                    </div>
                    <button
                      className="btn-remove"
                      onClick={() => removeItem(index)}
                      type="button"
                      title="Remove item"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Status alerts */}
            {submitStatus?.error && (
              <div className="alert-badge alert-error" role="alert">
                ❌ {submitStatus.error}
              </div>
            )}
            {submitStatus?.success && (
              <div className="alert-badge alert-success" role="status">
                ✅ {submitStatus.success}
              </div>
            )}

            {/* Submit Order Button */}
            <button
              className="btn btn-submit"
              onClick={handleSubmitOrder}
              disabled={isSubmitting || cart.length === 0}
              type="button"
            >
              {isSubmitting ? "Placing Order..." : "Submit Order"}
            </button>
          </div>
        </div>
      </div>

      {/* Live Placed Orders Section (Full-Stack Backend Connection) */}
      {placedOrders.length > 0 && (
        <section className="placed-orders-section card-box">
          <div className="section-title-row">
            <h3>Recent Active Orders in Kitchen (Live API)</h3>
            <button className="btn-refresh" onClick={loadOrders} type="button">🔄 Refresh</button>
          </div>
          <div className="placed-orders-grid">
            {placedOrders.map((ord) => (
              <div key={ord.id} className="placed-order-card">
                <div className="order-card-header">
                  <span className="order-tag">Order #{ord.id}</span>
                  <button
                    className="btn-cancel"
                    onClick={() => handleCancelOrder(ord.id)}
                    title="Cancel order"
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
                <h4 className="order-item-name">{ord.itemName}</h4>
                <div className="order-details-pills">
                  <span>Qty: {ord.qty}</span>
                  <span>Portion: {ord.weightG}g</span>
                  <span className="kcal-pill">{ord.kcal} kcal</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
