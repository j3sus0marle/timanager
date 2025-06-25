// src/App.tsx
import { useState, useEffect, JSX } from 'react';
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Proyectos from "./pages/Proyectos";
import Cotizaciones from "./pages/Cotizaciones";
import CotizacionesElectricas from "./pages/CotizacionesElectricas";
import OrdenesCompra from "./pages/OrdenesCompra";
import Clientes from "./pages/Clientes";
import Vendedores from "./pages/Vendedores";
import Productos from "./pages/Mat-elec";
import Inventario from "./pages/Inventario";
import InventarioExterior from "./pages/InventarioExterior";
import Guias from "./pages/Guias";
import Login from "./components/Login";
import Register from "./components/Register";
import UsuarioConfig from "./pages/UsuarioConfig";
import { jwtDecode } from 'jwt-decode';
import SessionTimeout from './components/SessionTimeout';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [username, setUsername] = useState<string | null>(null);
  const navigate = useNavigate();

  // --- Sesión expira tras 4 horas de inactividad ---
  useEffect(() => {
    if (!token) return;
    let timeoutId: NodeJS.Timeout;
    const INACTIVITY_LIMIT = 4 * 60 * 60 * 1000; // 4 horas en ms
    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleLogout();
        navigate('/login');
      }, INACTIVITY_LIMIT);
    };
    // Eventos que reinician el temporizador
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [token]);
  
  useEffect(() => {
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUsername(decoded.username);
      } catch {
        setUsername(null);
      }
    } else {
      setUsername(null);
    }
  }, [token]);

  const handleLogin = (tok: string, user: string) => {
    localStorage.setItem('token', tok);
    setToken(tok);
    setUsername(user);
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUsername(null);
  };
  const handleUpdateUser = (newUsername: string) => {
    setUsername(newUsername);
  };

  return (
    <>
      <SessionTimeout token={token} onLogout={handleLogout} />
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onRegister={() => {}} />} />
        <Route path="/" element={<PrivateRoute><MainLayout username={username} onLogout={handleLogout} /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="proyectos" element={<Proyectos />} />
          <Route path="ordenes-compra" element={<OrdenesCompra />} />
          <Route path="cotizaciones" element={<Cotizaciones />} />
          <Route path="cotizaciones-electricas" element={<CotizacionesElectricas />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="vendedores" element={<Vendedores />} />
          <Route path="mat-elec" element={<Productos />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="inventarioExterior" element={<InventarioExterior />} />
          <Route path="guias" element={<Guias />} />
          <Route path="/usuario" element={<UsuarioConfig username={username || ''} onUpdate={handleUpdateUser} />} />

        </Route>
      </Routes>
    </>
  );
}

export default App;
