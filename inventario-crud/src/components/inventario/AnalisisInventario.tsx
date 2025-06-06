import React, { useEffect, useState } from "react";
import { Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';
import dayjs from "dayjs";
import axios from "axios";
import { IInventoryItem, IInventoryMovement } from "../../types";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28CFF"];

const AnalisisInventario: React.FC = () => {
  const [topItems, setTopItems] = useState<IInventoryItem[]>([]);
  const [movimientos, setMovimientos] = useState<IInventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);

  // Fechas para semana y mes actual
  const hoy = dayjs();
  const startOfWeek = hoy.startOf('week').toISOString();
  const endOfWeek = hoy.endOf('week').toISOString();
  const startOfMonth = hoy.startOf('month').toISOString();
  const endOfMonth = hoy.endOf('month').toISOString();

  // Cálculo de días de la semana actual
  const diasSemana = Array.from({ length: 7 }, (_, i) => hoy.startOf('week').add(i, 'day'));
  const diasSemanaLabels = diasSemana.map(dia => dia.format('ddd D/M'));

  // Entradas y salidas por día de la semana actual
  const entradasPorDiaSemana = diasSemana.map(dia => (
    movimientos.filter(mov => mov.tipo === 'entrada' && dayjs(mov.fecha).isSame(dia, 'day')).reduce((sum, mov) => sum + mov.cantidad, 0)
  ));
  const salidasPorDiaSemana = diasSemana.map(dia => (
    movimientos.filter(mov => mov.tipo === 'salida' && dayjs(mov.fecha).isSame(dia, 'day')).reduce((sum, mov) => sum + mov.cantidad, 0)
  ));
  const lineSemanaData = {
    labels: diasSemanaLabels,
    datasets: [
      {
        label: 'Entradas',
        data: entradasPorDiaSemana,
        borderColor: '#00C49F',
        backgroundColor: 'rgba(0,196,159,0.2)',
        tension: 0.4,
      },
      {
        label: 'Salidas',
        data: salidasPorDiaSemana,
        borderColor: '#FF8042',
        backgroundColor: 'rgba(255,128,66,0.2)',
        tension: 0.4,
      },
    ],
  };

  // Cálculo de días del mes actual
  const diasMes = Array.from({ length: hoy.daysInMonth() }, (_, i) => hoy.startOf('month').add(i, 'day'));
  const diasMesLabels = diasMes.map(dia => dia.format('D/M'));

  // Entradas y salidas por día del mes actual
  const entradasPorDiaMes = diasMes.map(dia => (
    movimientos.filter(mov => mov.tipo === 'entrada' && dayjs(mov.fecha).isSame(dia, 'day')).reduce((sum, mov) => sum + mov.cantidad, 0)
  ));
  const salidasPorDiaMes = diasMes.map(dia => (
    movimientos.filter(mov => mov.tipo === 'salida' && dayjs(mov.fecha).isSame(dia, 'day')).reduce((sum, mov) => sum + mov.cantidad, 0)
  ));
  const lineEntradasSalidasData = {
    labels: diasMesLabels,
    datasets: [
      {
        label: 'Entradas',
        data: entradasPorDiaMes,
        borderColor: '#00C49F',
        backgroundColor: 'rgba(0,196,159,0.2)',
        tension: 0.4,
      },
      {
        label: 'Salidas',
        data: salidasPorDiaMes,
        borderColor: '#FF8042',
        backgroundColor: 'rgba(255,128,66,0.2)',
        tension: 0.4,
      },
    ],
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Traer inventario completo
      const itemsRes = await axios.get<IInventoryItem[]>(import.meta.env.VITE_API_URL + 'inventario/');
      // Traer movimientos del mes
      const movsRes = await axios.get<IInventoryMovement[]>(import.meta.env.VITE_API_URL + 'inventory-movements', {
        params: { desde: startOfMonth, hasta: endOfMonth }
      });
      setTopItems(
        [...itemsRes.data]
          .sort((a, b) => b.cantidad - a.cantidad)
          .slice(0, 5)
      );
      setMovimientos(movsRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Pie: Top 5 en almacén
  const pieLabels = topItems.map(item => item.descripcion);
  const pieData = {
    labels: pieLabels,
    datasets: [
      {
        data: topItems.map(item => item.cantidad),
        backgroundColor: COLORS,
        borderWidth: 1,
      },
    ],
  };

  // Top productos con más salidas en la semana
  const salidasSemana = movimientos.filter(mov =>
    mov.tipo === "salida" &&
    dayjs(mov.fecha).isAfter(startOfWeek) &&
    dayjs(mov.fecha).isBefore(endOfWeek)
  );
  const salidasPorItemSemana = salidasSemana.reduce((acc, mov) => {
    const key = typeof mov.itemId === 'object' && mov.itemId && 'descripcion' in mov.itemId ? mov.itemId.descripcion : String(mov.itemId);
    acc[key] = (acc[key] || 0) + mov.cantidad;
    return acc;
  }, {} as Record<string, number>);
  const topSalidasSemanaArr = Object.entries(salidasPorItemSemana)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const topSalidasSemanaLabels = topSalidasSemanaArr.map(([name]) => name);
  const topSalidasSemanaValues = topSalidasSemanaArr.map(([, value]) => value);

  // Top productos con más salidas en el mes
  const salidasMes = movimientos.filter(mov =>
    mov.tipo === "salida" &&
    dayjs(mov.fecha).isAfter(startOfMonth) &&
    dayjs(mov.fecha).isBefore(endOfMonth)
  );
  const salidasPorItemMes = salidasMes.reduce((acc, mov) => {
    const key = typeof mov.itemId === 'object' && mov.itemId && 'descripcion' in mov.itemId ? mov.itemId.descripcion : String(mov.itemId);
    acc[key] = (acc[key] || 0) + mov.cantidad;
    return acc;
  }, {} as Record<string, number>);
  const topSalidasMesArr = Object.entries(salidasPorItemMes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const topSalidasMesLabels = topSalidasMesArr.map(([name]) => name);
  const topSalidasMesValues = topSalidasMesArr.map(([, value]) => value);

  return (
    <div>
      <h2 className="mb-4">Datos de Inventario</h2>
      {loading ? <div>Cargando datos...</div> : (
        <>
          {/* Pie: Top 5 en almacén */}
          <div className="card mb-4" style={{ maxWidth: 520, margin: "0 auto" }}>
            <div className="card-body">
              <h4 className="text-center">Top 5 Productos con mayor existencias en almacen</h4>
              <Pie data={pieData} options={{ plugins: { legend: { display: true, position: 'bottom' } } }} />
            </div>
          </div>

          {/* Tarjeta: Gráficas de entradas y salidas semana y mes */}
          <div className="card mb-4">
            <div className="card-body">
              <h4 className="text-center mb-4">Entradas y salidas de producto en almacén interno</h4>
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-center">Semana actual</h6>
                  <Line data={lineSemanaData} options={{ plugins: { legend: { display: true, position: 'bottom' } } }} />
                </div>
                <div className="col-md-6">
                  <h6 className="text-center">Mes actual</h6>
                  <Line data={lineEntradasSalidasData} options={{ plugins: { legend: { display: true, position: 'bottom' } } }} />
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta: Gráficas de productos con más salidas semana y mes */}
          <div className="card mb-4">
            <div className="card-body">
              <h4 className="text-center mb-4">Top 5 productos con más salidas</h4>
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-center">Semana actual</h6>
                  <Line data={{
                    labels: topSalidasSemanaLabels,
                    datasets: [{
                      label: 'Salidas',
                      data: topSalidasSemanaValues,
                      borderColor: '#FF8042',
                      backgroundColor: 'rgba(255,128,66,0.2)',
                      tension: 0.4,
                    }],
                  }} options={{ plugins: { legend: { display: false } } }} />
                </div>
                <div className="col-md-6">
                  <h6 className="text-center">Mes actual</h6>
                  <Line data={{
                    labels: topSalidasMesLabels,
                    datasets: [{
                      label: 'Salidas',
                      data: topSalidasMesValues,
                      borderColor: '#0088FE',
                      backgroundColor: 'rgba(0,136,254,0.2)',
                      tension: 0.4,
                    }],
                  }} options={{ plugins: { legend: { display: false } } }} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalisisInventario;
