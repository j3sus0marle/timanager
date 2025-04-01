import { useState, useEffect } from "react";
import axios from "axios";
import { IItem } from "../types";
import { Modal, Button, Table, Form } from "react-bootstrap";

const ItemList: React.FC = () => {
  const [items, setItems] = useState<IItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<IItem[]>([]);
  const [newItem, setNewItem] = useState({ nombre: "", descripcion: "", cantidad: 0, precio: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editedItem, setEditedItem] = useState<IItem | null>(null); // Estado para los cambios de edición
  const urlSever="http://192.168.100.25:5000/api/items/"; 
  const fetchItems = async () => {
    try {
      const res = await axios.get<IItem[]>(urlSever);
      setItems(res.data);
      setFilteredItems(res.data); // Inicialmente se muestran todos los items
    } catch (error) {
      console.error("Error al obtener los items:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(urlSever+id);
      fetchItems();
    } catch (error) {
      console.error("Error al eliminar el item:", error);
    }
  };

  const handleAddItem = async () => {
    try {
      await axios.post(urlSever, newItem);
      setNewItem({ nombre: "", descripcion: "", cantidad: 0, precio: 0 });
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
      setEditedItem({ ...itemToEdit }); // Guardar el item para edición
    }
  };

  const handleSaveEditItem = async () => {
    if (editedItem) {
      try {
        await axios.put(urlSever+editItemId, editedItem);
        setEditItemId(null);
        setEditedItem(null); // Limpiar los campos de edición
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
          item.nombre.toLowerCase().includes(term.toLowerCase()) ||
          item.descripcion.toLowerCase().includes(term.toLowerCase()) // Buscar también en descripción
      );
      setFilteredItems(filtered);
    }
  };
  

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="container mt-4">
      {/* Fila de búsqueda y botón agregar */}
      <div className="d-flex justify-content-between mb-3">
        <Form.Control
          type="text"
          placeholder="Buscar por nombre..."
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
            <th>Nombre</th>
            <th>Descripcion</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item) => (
            <tr key={item._id}>
              <td>
                {editItemId === item._id ? (
                  <Form.Control
                    type="text"
                    value={editedItem?.nombre || ""}
                    onChange={(e) =>
                      setEditedItem((prev) => prev ? { ...prev, nombre: e.target.value } : prev)
                    }
                  />
                ) : (
                  item.nombre
                )}
              </td>
              <td>
                {editItemId === item._id ? (
                  <Form.Control
                    type="text"
                    value={editedItem?.descripcion || ""}
                    onChange={(e) =>
                      setEditedItem((prev) => prev ? { ...prev, descripcion: e.target.value } : prev)
                    }
                  />
                ) : (
                  item.descripcion
                )}
              </td>
              <td>
                {editItemId === item._id ? (
                  <Form.Control
                    type="number"
                    value={editedItem?.cantidad || 0}
                    onChange={(e) =>
                      setEditedItem((prev) => prev ? { ...prev, cantidad: Number(e.target.value) } : prev)
                    }
                  />
                ) : (
                  item.cantidad
                )}
              </td>
              <td>
                {editItemId === item._id ? (
                  <Form.Control
                    type="number"
                    value={editedItem?.precio || 0}
                    onChange={(e) =>
                      setEditedItem((prev) => prev ? { ...prev, precio: Number(e.target.value) } : prev)
                    }
                  />
                ) : (
                  item.precio
                )}
              </td>
              <td>
                {editItemId === item._id ? (
                  <Button variant="primary" onClick={handleSaveEditItem}>
                    Guardar
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="warning"
                      className="me-2"
                      onClick={() => handleEditItem(item._id!)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(item._id!)}
                    >
                      Eliminar
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal para agregar items */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Nuevo Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            Nombre
          <Form.Control
            className="mb-2"
            type="text"
            placeholder="Nombre"
            value={newItem.nombre}
            onChange={(e) => setNewItem({ ...newItem, nombre: e.target.value })}
          />
            Descripcion
          <Form.Control
            className="mb-2"
            type="text"
            placeholder="Descripcion"
            value={newItem.descripcion}
            onChange={(e) => setNewItem({ ...newItem, descripcion: e.target.value })}
          />
            Cantidad
          <Form.Control
            className="mb-2"
            type="number"
            placeholder="Cantidad"
            value={newItem.cantidad}
            onChange={(e) =>
              setNewItem({ ...newItem, cantidad: Number(e.target.value) })
            }
          />
            Precio
          <Form.Control
            type="number"
            placeholder="Precio"
            value={newItem.precio}
            onChange={(e) =>
              setNewItem({ ...newItem, precio: Number(e.target.value) })
            }
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleAddItem}>
            Agregar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ItemList;
