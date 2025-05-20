import { useState, useEffect } from "react";
import axios from "axios";
import { IInventoryItem } from "../types";
import { Modal, Button, Table, Form, Row, Col } from "react-bootstrap";

const Inventario: React.FC = () => {
  const [items, setItems] = useState<IInventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<IInventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);
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

  const urlServer = import.meta.env.VITE_API_URL + "inventario/";

  const fetchItems = async () => {
    try {
      const res = await axios.get<IInventoryItem[]>(urlServer);
      setItems(res.data);
      setFilteredItems(res.data);
    } catch (error) {
      console.error("Error al obtener inventario:", error);
    }
  };

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

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(urlServer + id);
      fetchItems();
    } catch (error) {
      console.error("Error al eliminar item:", error);
    }
  };

  const handleEditItem = (item: IInventoryItem) => {
    setEditItemId(item._id ?? null);
    setNewItem({ ...item });
    setShowModal(true);
  };

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
          item.categorias.some((cat) => cat.toLowerCase().includes(lowerTerm))
      );
      setFilteredItems(filtered);
    }
  };

  const handleSerieChange = (index: number, value: string) => {
    setNewItem((prev) => {
      const nuevos = [...prev.numerosSerie];
      nuevos[index] = value;
      return { ...prev, numerosSerie: nuevos };
    });
  };

  const addSerieField = () => {
    setNewItem((prev) => ({
      ...prev,
      numerosSerie: [...prev.numerosSerie, ""],
    }));
  };

  const handleCategoriaChange = (categoria: string) => {
    setNewItem((prev) => {
      const yaExiste = prev.categorias.includes(categoria);
      return {
        ...prev,
        categorias: yaExiste
          ? prev.categorias.filter((cat) => cat !== categoria)
          : [...prev.categorias, categoria],
      };
    });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between mb-3">
        <Form.Control
          type="text"
          placeholder="Buscar por descripción, marca, modelo o categoría..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: "70%" }}
        />
        <Button variant="success" onClick={() => setShowModal(true)}>
          Agregar Artículo
        </Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Descripción</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Proveedor</th>
            <th>Unidad</th>
            <th>Precio Unitario</th>
            <th>Cantidad</th>
            <th>Categorías</th>
            <th>Números de Serie</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item) => (
            <tr key={item._id}>
              <td>{item.descripcion}</td>
              <td>{item.marca}</td>
              <td>{item.modelo}</td>
              <td>{item.proveedor}</td>
              <td>{item.unidad}</td>
              <td>{item.precioUnitario}</td>
              <td>{item.cantidad}</td>
              <td>{item.categorias.join(", ")}</td>
              <td>{item.numerosSerie.join(", ")}</td>
              <td>
                <Button
                  variant="warning"
                  className="me-2"
                  onClick={() => handleEditItem(item)}
                >
                  Editar
                </Button>
                <Button variant="danger" onClick={() => handleDelete(item._id!)}>
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          resetModalState();
        }}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Agregar Artículo al Inventario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            {[
              { field: "descripcion", label: "Descripción" },
              { field: "marca", label: "Marca" },
              { field: "modelo", label: "Modelo" },
              { field: "proveedor", label: "Proveedor" },
            ].map(({ field, label }) => (
              <Col md={6} className="mb-3" key={field}>
                <Form.Label>{label}</Form.Label>
                <Form.Control
                  type="text"
                  value={(newItem as any)[field]}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, [field]: e.target.value }))
                  }
                />
              </Col>
            ))}

            <Col md={4} className="mb-3">
              <Form.Label>Unidad</Form.Label>
              <Form.Select
                value={newItem.unidad}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, unidad: e.target.value }))
                }
              >
                <option value="PZA">PZA</option>
                <option value="MTS">MTS</option>
              </Form.Select>
            </Col>

            <Col md={4} className="mb-3">
              <Form.Label>Precio Unitario</Form.Label>
              <Form.Control
                type="number"
                value={newItem.precioUnitario}
                onChange={(e) =>
                  setNewItem((prev) => ({
                    ...prev,
                    precioUnitario: Number(e.target.value),
                  }))
                }
              />
            </Col>

            <Col md={4} className="mb-3">
              <Form.Label>Cantidad</Form.Label>
              <Form.Control
                type="number"
                value={newItem.cantidad}
                onChange={(e) =>
                  setNewItem((prev) => ({
                    ...prev,
                    cantidad: Number(e.target.value),
                  }))
                }
              />
            </Col>

            <Col md={12} className="mb-3">
  <Form.Label>Categorías</Form.Label>
  <Row>
    {["Cómputo", "Alarma", "Control de Acceso", "Redes", "Electricidad", "Videovigilancia"].map(
      (categoria, index) => (
        <Col md={6} key={index}>
          <Form.Check
            type="checkbox"
            label={categoria}
            checked={newItem.categorias.includes(categoria)}
            onChange={() => handleCategoriaChange(categoria)}
            className="mb-2"
          />
        </Col>
      )
    )}
  </Row>
</Col>


            <Col md={12}>
              <Form.Label>Números de Serie</Form.Label>
              {newItem.numerosSerie.map((serie, index) => (
                <Form.Control
                  key={index}
                  className="mb-2"
                  type="text"
                  value={serie}
                  placeholder={`Número de serie ${index + 1}`}
                  onChange={(e) => handleSerieChange(index, e.target.value)}
                />
              ))}
              <Button variant="outline-primary" onClick={addSerieField} size="sm">
                + Agregar número de serie
              </Button>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleSaveItem}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Inventario;
