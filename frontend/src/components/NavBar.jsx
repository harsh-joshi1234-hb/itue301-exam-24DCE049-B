import { NavLink } from "react-router-dom";

export default function NavBar() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand">
          <span className="brand-icon">🍲</span>
          <div className="brand-text">
            <span className="brand-title">DEPSTAR Canteen</span>
            <span className="brand-sub">Campus Pre-Order</span>
          </div>
        </div>
        <nav className="nav-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            Menu
          </NavLink>
          <NavLink
            to="/order"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            Order
          </NavLink>
          <NavLink
            to="/specials"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            Specials
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
