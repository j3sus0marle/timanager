// Componente principal de la lista de inventario
import { useState, useEffect } from "react";
import axios from "axios";
import { IInventoryItem } from "../types";
import { Button } from "react-bootstrap";
import SearchBar from "./common/SearchBar";
import DataTable, { DataTableColumn } from "./common/DataTable";
import ExportExcelButton from "./common/ExportExcelButton";
import PaginationCompact from "./common/PaginationCompact";
import ItemModal from "./common/ItemModal";

// Componente funcional para la página de inventario
const Inventario: React.FC = () => {
  // Estado para los artículos del inventario
  const [items, setItems] = useState<IInventoryItem[]>([]);
  // Estado para los artículos filtrados (por búsqueda)
  const [filteredItems, setFilteredItems] = useState<IInventoryItem[]>([]);
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  // Estado para mostrar/ocultar el modal de agregar/editar
  const [showModal, setShowModal] = useState(false);
  // Estado para el id del artículo en edición
  const [editItemId, setEditItemId] = useState<string | null>(null);
  // Estado para el artículo nuevo o en edición
  const [newItem, setNewItem] = useState<IInventoryItem>({
    descripcion: "",
    marca: "",
    modelo: "",
    proveedor: "",
    unidad: "PZA",
    precioUnitario: 0,
    cantidad: 0,
    numerosSerie: [],
    categorias: [],
  });
  // Estado para la página actual de la paginación
  const [currentPage, setCurrentPage] = useState(1);
  // Cantidad de artículos por página
  const itemsPerPage = 10;

  // URL base del backend para inventario
  const urlServer = import.meta.env.VITE_API_URL + "inventario/";

  // Función para obtener los artículos del backend
  const fetchItems = async () => {
    try {
      const res = await axios.get<IInventoryItem[]>(urlServer);
      setItems(res.data);
      setFilteredItems(res.data);
    } catch (error) {
      console.error("Error al obtener inventario:", error);
    }
  };

  // Guardar (crear o editar) un artículo
  const handleSaveItem = async () => {
    try {
      if (editItemId) {
        await axios.put(urlServer + editItemId, newItem);
      } else {
        const { _id, ...itemWithoutId } = newItem as any;
        await axios.post(urlServer, itemWithoutId);
      }
      setShowModal(false);
      resetModalState();
      fetchItems();
    } catch (error) {
      console.error("Error al guardar el item:", error);
    }
  };

  // Restablece el estado del modal y limpia el formulario
  const resetModalState = () => {
    setNewItem({
      descripcion: "",
      marca: "",
      modelo: "",
      proveedor: "",
      unidad: "PZA",
      precioUnitario: 0,
      cantidad: 0,
      numerosSerie: [],
      categorias: [],
    });
    setEditItemId(null);
  };

  // Elimina un artículo por id
  const handleDelete = async (id: string) => {
    // Confirmación antes de eliminar
    const confirmed = window.confirm("¿Estás seguro de que deseas eliminar este artículo? Esta acción no se puede deshacer.");
    if (!confirmed) return;
    try {
      await axios.delete(urlServer + id);
      fetchItems();
    } catch (error) {
      console.error("Error al eliminar item:", error);
    }
  };

  // Prepara el modal para editar un artículo
  const handleEditItem = (item: IInventoryItem) => {
    setEditItemId(item._id ?? null);
    setNewItem({ ...item });
    setShowModal(true);
  };

  // Filtra los artículos según el término de búsqueda
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term === "") {
      setFilteredItems(items);
    } else {
      const lowerTerm = term.toLowerCase();
      const filtered = items.filter(
        (item) =>
          item.descripcion.toLowerCase().includes(lowerTerm) ||
          item.marca.toLowerCase().includes(lowerTerm) ||
          item.modelo.toLowerCase().includes(lowerTerm) ||
          item.categorias.some((cat) => cat.toLowerCase().includes(lowerTerm)) ||
          item.numerosSerie.some((num) => num.toLowerCase().includes(lowerTerm))
      );
      setFilteredItems(filtered);
    }
  };

  // Definición de las columnas para la tabla reutilizable
  const columns: DataTableColumn<IInventoryItem>[] = [
    { key: "marca", label: "Marca" },
    { key: "modelo", label: "Modelo" },
    { key: "descripcion", label: "Descripción" },
    { key: "unidad", label: "Unidad" },
    { key: "precioUnitario", label: "Precio Unitario" },
    { key: "cantidad", label: "Cantidad" },
    { key: "numerosSerie", label: "Números de Serie", render: (item) => item.numerosSerie.join(", ") },
  ];

  // Cálculo de la paginación
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Cambia la página currentPage
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Carga los artículos al montar el componente
  useEffect(() => {
    fetchItems();
  }, []);

  // Reinicia la página al cambiar el filtro/búsqueda
  useEffect(() => {
    setCurrentPage(1); // Reset page when filter/search changes
  }, [filteredItems.length]);

  // Renderizado del componente
  return (
    <div className="container-fluid mt-4 px-1 px-sm-3">
      {/* Barra de búsqueda y botones de acción */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch gap-2 mb-3">
        <SearchBar
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Buscar por descripción, marca, modelo o categoría..."
          className="flex-grow-1"
        />
        <div className="d-flex flex-row flex-wrap flex-md-nowrap gap-2 w-100 w-md-auto mt-2 mt-md-0">
          <Button
            variant="success"
            className="w-100 w-md-auto"
            onClick={() => setShowModal(true)}
          >
            Agregar Artículo
          </Button>
          <ExportExcelButton
            data={items.map(({ _id, ...item }) => item)}
            fileName={`inventario_${new Date().toISOString().slice(0,10)}.xlsx`}
            sheetName="Inventario"
            className="w-100 w-md-auto"
          />
        </div>
      </div>

      {/* Tabla de inventario */}
      <div
        className="table-responsive"
        style={{
          minHeight: `calc(100vh - 270px)`, // Ajusta el 270px según el header, searchbar y paddings
          maxHeight: `calc(100vh - 270px)`,
          overflowY: "auto",
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <DataTable
          columns={columns}
          data={paginatedItems}
          actions={(item) => (
            <div className="d-flex flex-column flex-sm-row align-items-stretch gap-1">
              <Button
                variant="warning"
                size="sm"
                className="w-100 w-sm-auto"
                onClick={() => handleEditItem(item)}
              >
                Editar
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="w-100 w-sm-auto"
                onClick={() => handleDelete(item._id!)}
              >
                Eliminar
              </Button>
            </div>
          )}
          className="small"
          style={{ marginBottom: 0 }}
        />
      </div>

      {/* Paginación compacta */}
      <div className="d-flex justify-content-center my-3">
        <PaginationCompact
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Modal para agregar/editar artículo */}
      <ItemModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          resetModalState();
        }}
        onSave={handleSaveItem}
        item={newItem}
        setItem={setNewItem}
        isEdit={!!editItemId}
      />
    </div>
  );
};

export default Inventario;
