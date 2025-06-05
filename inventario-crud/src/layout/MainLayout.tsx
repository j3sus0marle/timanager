// src/layout/MainLayout.tsx
import { Link, Outlet, useLocation } from "react-router-dom";
import "./MainLayout.css"; // puedes usar Bootstrap o tu propio CSS
import { useState } from "react";
import { FaBars } from "react-icons/fa";

const MainLayout: React.FC = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/proyectos", label: "Proyectos" },
    { path: "/cotizaciones", label: "Cotizaciones" },
    { path: "/cotizaciones-electricas", label: "Cotizaciones Eléctricas" },
    { path: "/clientes", label: "Clientes" },
    { path: "/vendedores", label: "Vendedores" },
    { path: "/mat-elec", label: "Material Electrico" },
    { path: "/inventario", label: "Inventario" },
  ];

  return (
    <div className="d-flex vh-100">
      {/* Botón hamburguesa para móviles */}
      <button
        className="menu-toggle d-md-none"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Mostrar menú"
      >
        <FaBars size={24} />
      </button>
      <nav
        className={`main-nav bg-dark text-white p-3 ${menuOpen ? "open" : ""}`}
      >
        <h4 className="text-center mb-4">Menú</h4>
        <ul className="nav flex-column">
          {navItems.map((item) => (
            <li className="nav-item mb-2" key={item.path}>
              <Link
                to={item.path}
                className={`nav-link text-white ${
                  location.pathname === item.path ? "fw-bold" : ""
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <main className="flex-grow-1 p-4 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
