import { useState, useEffect } from "react";
import axios from "axios";
import { IItem } from "../types";
import { Modal, Button, Table, Form } from "react-bootstrap";

const ItemList: React.FC = () => {
  const [items, setItems] = useState<IItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<IItem[]>([]);
  const [newItem, setNewItem] = useState<IItem>({
    descripcion: "",
    marca: "",
    modelo: "",
    proveedor: "",
    unidad: "PZA",
    cantidad: 0,
    precioUnitario: 0,
    categoria: [],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editedItem, setEditedItem] = useState<IItem | null>(null);
  const urlServer = "http://localhost:6051/api/items/";

  const fetchItems = async () => {
    try {
      const res = await axios.get<IItem[]>(urlServer);
      setItems(res.data);
      setFilteredItems(res.data);
    } catch (error) {
      console.error("Error al obtener los items:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(urlServer + id);
      fetchItems();
    } catch (error) {
      console.error("Error al eliminar el item:", error);
    }
  };

  const handleAddItem = async () => {
    try {
      await axios.post(urlServer, newItem);
      setNewItem({
        descripcion: "",
        marca: "",
        modelo: "",
        proveedor: "",
        unidad: "",
        cantidad: 0,
        precioUnitario: 0,
        categoria: [""],
      });
      setShowModal(false);
      fetchItems();
    } catch (error) {
      console.error("Error al agregar el item:", error);
    }
  };

  const handleEditItem = (id: string) => {
    const itemToEdit = items.find((item) => item._id === id);
    if (itemToEdit) {
      setEditItemId(id);
      setEditedItem({ ...itemToEdit });
    }
  };

  const handleSaveEditItem = async () => {
    if (editedItem && editItemId) {
      try {
        await axios.put(urlServer + editItemId, editedItem);
        setEditItemId(null);
        setEditedItem(null);
        fetchItems();
      } catch (error) {
        console.error("Error al modificar el item:", error);
      }
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term === "") {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(
        (item) =>
          item.descripcion.toLowerCase().includes(term.toLowerCase()) ||
          item.marca.toLowerCase().includes(term.toLowerCase()) ||
          item.modelo.toLowerCase().includes(term.toLowerCase()) ||
          item.categoria.some((cat) => cat.toLowerCase().includes(term.toLowerCase())) // Aquí se busca en las categorías
      );
      setFilteredItems(filtered);
    }
  };
  

  useEffect(() => {
    fetchItems();
  }, []);

  const renderEditableField = (
    name: keyof IItem,
    type: string = "text"
  ) => (
    <Form.Control
      type={type}
      value={(editedItem?.[name] ?? "") as string | number}
      onChange={(e) =>
        setEditedItem((prev) =>
          prev
            ? { ...prev, [name]: type === "number" ? Number(e.target.value) : e.target.value }
            : prev
        )
      }
    />
  );

  const handleCategoryChange = (category: string) => {
    if (editedItem) {
      const newCategories = editedItem.categoria.includes(category)
        ? editedItem.categoria.filter((cat) => cat !== category)
        : [...editedItem.categoria, category];
      setEditedItem({ ...editedItem, categoria: newCategories });
    }
  };

  return (
    <div className="container mt-4">
      {/* Búsqueda y botón agregar */}
      <div className="d-flex justify-content-between mb-3">
        <Form.Control
          type="text"
          placeholder="Buscar por descripción, marca o modelo..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: "70%" }}
        />
        <Button variant="success" onClick={() => setShowModal(true)}>
          Agregar Item
        </Button>
      </div>

      {/* Tabla de Items */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Descripción</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Proveedor</th>
            <th>Unidad</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Categoría</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item) => (
            <tr key={item._id}>
              {["descripcion", "marca", "modelo", "proveedor", "unidad", "cantidad", "precioUnitario", "categoria"].map((field) => (
                <td key={field}>
                  {editItemId === item._id ? (
                    renderEditableField(field as keyof IItem, field === "cantidad" || field === "precioUnitario" ? "number" : "text")
                  ) : (
                    field === "categoria" ? (
                      item.categoria.join(", ")
                    ) : (
                      item[field as keyof IItem] // Aquí usamos acceso explícito
                    )
                  )}
                </td>
              ))}
              <td>
                {editItemId === item._id ? (
                  <Button variant="primary" onClick={handleSaveEditItem}>
                    Guardar
                  </Button>
                ) : (
                  <>
                    <Button variant="warning" className="me-2" onClick={() => handleEditItem(item._id!)}>
                      Editar
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(item._id!)}>
                      Eliminar
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal Agregar */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Nuevo Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {[
            { field: "descripcion", label: "Descripción", placeholder: "Ej. TUBERÍA 3/4" },
            { field: "marca", label: "Marca", placeholder: "Ej. TRUPER" },
            { field: "modelo", label: "Modelo", placeholder: "Ej. XY123" },
            { field: "proveedor", label: "Proveedor", placeholder: "Ej. FERREMATERIALES" },
          ].map(({ field, label, placeholder }) => (
            <Form.Group className="mb-2" key={field}>
              <Form.Label>{label}</Form.Label>
              <Form.Control
                type="text"
                placeholder={placeholder}
                value={(newItem as any)[field]}
                onChange={(e) =>
                  setNewItem((prev) => ({
                    ...prev,
                    [field]: e.target.value,
                  }))
                }
              />
            </Form.Group>
          ))}

          {/* Unidad (Select) */}
          <Form.Group className="mb-2">
            <Form.Label>Unidad</Form.Label>
            <Form.Select
              value={newItem.unidad}
              onChange={(e) => setNewItem((prev) => ({ ...prev, unidad: e.target.value as "PZA" | "MTS" }))}
            >
              <option value="PZA">PZA</option>
              <option value="MTS">MTS</option>
            </Form.Select>
          </Form.Group>

          {/* Cantidad */}
          <Form.Group className="mb-2">
            <Form.Label>Cantidad</Form.Label>
            <Form.Control
              type="number"
              placeholder="Ej. 15"
              value={newItem.cantidad}
              onChange={(e) => setNewItem((prev) => ({ ...prev, cantidad: Number(e.target.value) }))}
            />
          </Form.Group>

          {/* Precio Unitario */}
          <Form.Group className="mb-2">
            <Form.Label>Precio Unitario</Form.Label>
            <Form.Control
              type="number"
              placeholder="Ej. 120.50"
              value={newItem.precioUnitario}
              onChange={(e) => setNewItem((prev) => ({ ...prev, precioUnitario: Number(e.target.value) }))}
            />
          </Form.Group>

          {/* Categorías (Checkboxes) */}
          <Form.Group>
            <Form.Label>Categorías</Form.Label>
            <div className="mb-2">
              {["COMPUTO", "ALARMA", "CANALIZACION", "CONTROL ACCESO"].map((cat) => (
                <Form.Check
                  key={cat}
                  inline
                  type="checkbox"
                  label={cat}
                  value={cat}
                  checked={editedItem?.categoria.includes(cat)}
                  onChange={() => handleCategoryChange(cat)}
                />
              ))}
            </div>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleSaveEditItem}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ItemList;
