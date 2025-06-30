import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { OrdenCompra } from "../../types";
import OrdenCompraForm from "./OrdenCompraForm";
import SearchBar from "../common/SearchBar";
import DataTable, { DataTableColumn } from "../common/DataTable";
import PaginationCompact from "../common/PaginationCompact";
import axios from "axios";

const OrdenCompraList: React.FC = () => {
  const [ordenesCompra, setOrdenesCompra] = useState<OrdenCompra[]>([]);
  const [filteredOrdenes, setFilteredOrdenes] = useState<OrdenCompra[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  const urlServer = import.meta.env.VITE_API_URL;

  // Cargar órdenes de compra desde la API
  useEffect(() => {
    const cargarOrdenes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${urlServer}ordenes-compra/`);
        const ordenes = response.data as OrdenCompra[];
        setOrdenesCompra(ordenes);
        setFilteredOrdenes(ordenes);
      } catch (err) {
        console.error('Error al cargar órdenes de compra:', err);
        setError('Error al cargar las órdenes de compra');
        setOrdenesCompra([]);
        setFilteredOrdenes([]);
      } finally {
        setLoading(false);
      }
    };

    cargarOrdenes();
  }, [urlServer]);

  // Función para recargar las órdenes (se puede llamar desde el formulario)
  const recargarOrdenes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${urlServer}ordenes-compra/`);
      const ordenes = response.data as OrdenCompra[];
      setOrdenesCompra(ordenes);
      setFilteredOrdenes(ordenes);
    } catch (err) {
      console.error('Error al recargar órdenes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (!value) {
      setFilteredOrdenes(ordenesCompra);
    } else {
      const lower = value.toLowerCase();
      setFilteredOrdenes(ordenesCompra.filter(orden =>
        orden.numeroOrden.toLowerCase().includes(lower) ||
        (typeof orden.proveedor === 'object' && orden.proveedor.empresa.toLowerCase().includes(lower)) ||
        (typeof orden.razonSocial === 'object' && orden.razonSocial.nombre.toLowerCase().includes(lower))
      ));
    }
  };

  const handleNew = () => {
    setEditId(null);
    setShowModal(true);
  };

  const handleEdit = (orden: OrdenCompra) => {
    setEditId(orden._id || null);
    setShowModal(true);
  };

  const handleDelete = async (orden: OrdenCompra) => {
    if (!window.confirm("¿Está seguro de eliminar esta orden de compra?")) return;
    
    try {
      await axios.delete(`${urlServer}ordenes-compra/${orden._id}`);
      // Recargar la lista después de eliminar
      await recargarOrdenes();
    } catch (err) {
      console.error('Error al eliminar orden:', err);
      alert('Error al eliminar la orden de compra');
    }
  };

  const handleCloseForm = () => {
    setShowModal(false);
    setEditId(null);
  };

  const handleSaveForm = async (orden: OrdenCompra) => {
    try {
      if (editId) {
        // Editar orden existente
        await axios.put(`${urlServer}ordenes-compra/${editId}`, orden);
      } else {
        // Crear nueva orden
        await axios.post(`${urlServer}ordenes-compra/`, orden);
      }
      
      setShowModal(false);
      setEditId(null);
      
      // Recargar la lista después de guardar
      await recargarOrdenes();
      
    } catch (err) {
      console.error('Error al guardar orden:', err);
      alert('Error al guardar la orden de compra');
    }
  };

  // Función para ver PDF
  const handleVerPdf = (orden: OrdenCompra) => {
    if (!orden._id) {
      alert('No se puede mostrar el PDF: ID de orden no válido');
      return;
    }
    
    if (!orden.rutaPdf) {
      alert('No se ha generado PDF para esta orden de compra');
      return;
    }
    
    // Abrir PDF en nueva ventana
    const url = `${urlServer}ordenes-compra/${orden._id}/pdf`;
    window.open(url, '_blank');
  };

  // Función para descargar PDF
  const handleDescargarPdf = (orden: OrdenCompra) => {
    if (!orden._id) {
      alert('No se puede descargar el PDF: ID de orden no válido');
      return;
    }
    
    if (!orden.rutaPdf) {
      alert('No se ha generado PDF para esta orden de compra');
      return;
    }
    
    // Descargar PDF
    const url = `${urlServer}ordenes-compra/${orden._id}/pdf/descargar`;
    window.open(url, '_blank');
  };

  // Columnas para la tabla
  const columns: DataTableColumn<OrdenCompra>[] = [
    {
      key: "numeroOrden",
      label: "Número de Orden",
    },
    {
      key: "fecha",
      label: "Fecha",
      render: (orden) => new Date(orden.fecha).toLocaleDateString(),
    },
    {
      key: "proveedor",
      label: "Proveedor",
      render: (orden) => typeof orden.proveedor === 'object' ? orden.proveedor.empresa : orden.proveedor,
    },
    {
      key: "razonSocial",
      label: "Razón Social",
      render: (orden) => typeof orden.razonSocial === 'object' ? orden.razonSocial.nombre : orden.razonSocial,
    },
  ];

  // Paginación
  const totalPages = Math.ceil(filteredOrdenes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrdenes = filteredOrdenes.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="container-fluid mt-4 px-1 px-sm-3">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch gap-2 mb-3">
        <SearchBar
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Buscar por número de orden, proveedor o razón social..."
          className="flex-grow-1"
        />
        <Button variant="success" onClick={handleNew}>
          Nueva Orden de Compra
        </Button>
      </div>
      
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando órdenes de compra...</p>
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {!loading && !error && (
        <>
          <div className="table-responsive" style={{ minHeight: `calc(100vh - 270px)`, maxHeight: `calc(100vh - 270px)`, overflowY: "auto", background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
            <DataTable
              data={paginatedOrdenes}
              columns={columns}
              actions={(orden) => (
                <div className="d-flex flex-column flex-sm-row align-items-stretch gap-1">
                  <Button
                    variant="warning"
                    size="sm"
                    className="w-100 w-sm-auto"
                    onClick={() => handleEdit(orden)}
                  >
                    Editar
                  </Button>
                  {orden.rutaPdf && (
                    <Button
                      variant="info"
                      size="sm"
                      className="w-100 w-sm-auto"
                      onClick={() => handleVerPdf(orden)}
                      title="Ver PDF"
                    >
                      Ver PDF
                    </Button>
                  )}
                  {orden.rutaPdf && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-100 w-sm-auto"
                      onClick={() => handleDescargarPdf(orden)}
                      title="Descargar PDF"
                    >
                      📄
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-100 w-sm-auto"
                    onClick={() => handleDelete(orden)}
                  >
                    Eliminar
                  </Button>
                </div>
              )}
              className="small"
              style={{ marginBottom: 0 }}
            />
          </div>

          <div className="d-flex justify-content-center my-3">
            <PaginationCompact
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}

      <OrdenCompraForm
        show={showModal}
        onHide={handleCloseForm}
        onSave={handleSaveForm}
        editId={editId}
        onOrdenCreada={recargarOrdenes} // Recargar órdenes cuando se crea una nueva
      />
    </div>
  );
};

export default OrdenCompraList;
