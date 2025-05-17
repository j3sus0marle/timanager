import { useState, useEffect } from "react";
import axios from "axios";
import { IItem } from "../types";
import { Modal, Button, Table, Form, Row, Col } from "react-bootstrap";


const ItemList: React.FC = () => {
  const [items, setItems] = useState<IItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<IItem[]>([]);
  const [newItem, setNewItem] = useState<IItem>({
    descripcion: "",
    marca: "",
    modelo: "",
    proveedor: "",
    unidad: "PZA",
    precioUnitario: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editedItem, setEditedItem] = useState<IItem | null>(null);
  const urlServer = import.meta.env.VITE_API_URL + "items/";

  const handleCreateNewItem = async () => {
  try {
    await axios.post(urlServer, newItem);
    setShowModal(false);         // Cierra el modal
    setNewItem({                 // Resetea el formulario
      descripcion: "",
      marca: "",
      modelo: "",
      proveedor: "",
      unidad: "PZA",
      precioUnitario: 0,
    });
    fetchItems();                // Recarga la lista
  } catch (error) {
    console.error("Error al crear el nuevo item:", error);
  }
};


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
          item.modelo.toLowerCase().includes(term.toLowerCase())
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
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
  {filteredItems.map((item) => (
    <tr key={item._id}>
      {["descripcion", "marca", "modelo", "proveedor", "unidad", "cantidad", "precioUnitario"].map((field) => (
        <td key={field}>
          {editItemId === item._id ? (
            renderEditableField(
              field as keyof IItem,
              field === "cantidad" || field === "precioUnitario" ? "number" : "text"
            )
          ) : (
            item[field as keyof IItem]
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
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
  <Modal.Header closeButton className="bg-light border-bottom">
    <Modal.Title className="">Agregar Nuevo Ítem</Modal.Title>
  </Modal.Header>

  <Modal.Body className="px-4 py-3">
    <Row>
      {[
        { field: "descripcion", label: "Descripción", placeholder: "Ej. TUBERÍA 3/4" },
        { field: "marca", label: "Marca", placeholder: "Ej. TRUPER" },
        { field: "modelo", label: "Modelo", placeholder: "Ej. XY123" },
        { field: "proveedor", label: "Proveedor", placeholder: "Ej. FERREMATERIALES" },
      ].map(({ field, label, placeholder }) => (
        <Col md={6} key={field} className="mb-3">
          <Form.Label className="fw-semibold">{label}</Form.Label>
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
        </Col>
      ))}

      <Col md={4} className="mb-3">
        <Form.Label className="fw-semibold">Unidad</Form.Label>
        <Form.Select
          value={newItem.unidad}
          onChange={(e) =>
            setNewItem((prev) => ({ ...prev, unidad: e.target.value as "PZA" | "MTS" }))
          }
        >
          <option value="PZA">PZA</option>
          <option value="MTS">MTS</option>
        </Form.Select>
      </Col>

      <Col md={4} className="mb-3">
        <Form.Label className="fw-semibold">Precio Unitario</Form.Label>
        <Form.Control
          type="number"
          placeholder="Ej. 120.50"
          value={newItem.precioUnitario}
          onChange={(e) =>
            setNewItem((prev) => ({ ...prev, precioUnitario: Number(e.target.value) }))
          }
        />
      </Col>
    </Row>

  </Modal.Body>

  <Modal.Footer className="bg-light border-top">
    <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
      Cancelar
    </Button>
    <Button variant="success" onClick={handleCreateNewItem}>
      <i className="bi bi-check-circle me-2"></i>
      Guardar
    </Button>
  </Modal.Footer>
</Modal>

    </div>
  );
};

export default ItemList;
