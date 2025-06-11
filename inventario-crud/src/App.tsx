// src/App.tsx
import React, { useState, useEffect, JSX } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Proyectos from "./pages/Proyectos";
import Cotizaciones from "./pages/Cotizaciones";
import CotizacionesElectricas from "./pages/CotizacionesElectricas";
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

function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [username, setUsername] = useState<string | null>(null);

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
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onRegister={() => {}} />} />
        <Route path="/" element={<PrivateRoute><MainLayout username={username} onLogout={handleLogout} /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="proyectos" element={<Proyectos />} />
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
    </Router>
  );
}

export default App;
