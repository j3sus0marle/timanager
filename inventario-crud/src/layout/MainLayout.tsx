// src/layout/MainLayout.tsx
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "./MainLayout.css";
import { useState } from "react";
import { FaBars, FaCog } from "react-icons/fa";

const MainLayout: React.FC<{ username?: string | null, onLogout?: () => void }> = ({ username, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/proyectos", label: "Proyectos" },
    { path: "/guias", label: "Guias" },
    { path: "/cotizaciones", label: "Cotizaciones" },
    { path: "/cotizaciones-electricas", label: "Cotizaciones Eléctricas" },
    { path: "/clientes", label: "Clientes" },
    { path: "/vendedores", label: "Vendedores" },
    { path: "/mat-elec", label: "Material Electrico" },
    { path: "/inventario", label: "Inventario Interior" },
    { path: "/inventarioExterior", label: "Inventario Exterior" },
  ];

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };

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
        {/* Usuario arriba del menú y del título */}
        {username && (
          <div className="user-info mb-3 text-center border-bottom pb-2 d-flex flex-column align-items-center">
            <div className="d-flex align-items-center justify-content-center gap-2">
              <div>Usuario: <b>{username}</b></div>
              <button
                className="btn btn-link p-0 ms-2"
                title="Configuración de usuario"
                style={{ color: '#495057' }}
                onClick={() => navigate('/usuario')}
              >
                <FaCog size={18} />
              </button>
            </div>
          </div>
        )}
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
        {/* Botón de logout al final */}
        {username && (
          <div className="user-info mt-4 text-center">
            <button className="btn btn-sm btn-danger mt-2" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        )}
      </nav>

      <main className="flex-grow-1 p-4 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
