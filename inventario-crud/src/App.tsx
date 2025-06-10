// src/App.tsx
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


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
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
          {/* Redirigir cualquier ruta desconocida al dashboard */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
