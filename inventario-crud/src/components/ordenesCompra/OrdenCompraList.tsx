import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { OrdenCompra } from "../../types";
import OrdenCompraForm from "./OrdenCompraForm";
import SearchBar from "../common/SearchBar";
import DataTable, { DataTableColumn } from "../common/DataTable";
import PaginationCompact from "../common/PaginationCompact";

const OrdenCompraList: React.FC = () => {
  const [ordenesCompra, setOrdenesCompra] = useState<OrdenCompra[]>([]);
  const [filteredOrdenes, setFilteredOrdenes] = useState<OrdenCompra[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock data por ahora - más tarde se conectará con la API
  useEffect(() => {
    const mockData: OrdenCompra[] = [];
    setOrdenesCompra(mockData);
    setFilteredOrdenes(mockData);
  }, []);

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

  const handleDelete = (orden: OrdenCompra) => {
    if (!window.confirm("¿Está seguro de eliminar esta orden de compra?")) return;
    // TODO: Implementar delete cuando se conecte con la API
    console.log("Eliminar orden:", orden._id);
  };

  const handleCloseForm = () => {
    setShowModal(false);
    setEditId(null);
  };

  const handleSaveForm = (orden: OrdenCompra) => {
    // TODO: Implementar save cuando se conecte con la API
    console.log("Guardar orden:", orden);
    setShowModal(false);
    setEditId(null);
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

      <OrdenCompraForm
        show={showModal}
        onHide={handleCloseForm}
        onSave={handleSaveForm}
        editId={editId}
      />
    </div>
  );
};

export default OrdenCompraList;
