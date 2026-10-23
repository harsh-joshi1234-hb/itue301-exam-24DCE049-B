import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import MenuPage from "./pages/MenuPage";
import OrderPage from "./pages/OrderPage";
import SpecialsPage from "./pages/SpecialsPage";

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<MenuPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/specials" element={<SpecialsPage />} />
      </Routes>
    </>
  );
}
