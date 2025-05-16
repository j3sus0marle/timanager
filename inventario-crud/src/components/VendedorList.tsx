import { useEffect, useState } from "react";
import axios from "axios";
import { Button, Table, Modal, Form } from "react-bootstrap";

interface Vendedor {
  _id?: string;
  nombre: string;
  correo: string;
  telefono: string;
}

const VendedorList: React.FC = () => {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newVendedor, setNewVendedor] = useState<Vendedor>({ nombre: "", correo: "", telefono: "" });
  const [editVendedorId, setEditVendedorId] = useState<string | null>(null);
  const [editedVendedor, setEditedVendedor] = useState<Vendedor | null>(null);

  const url = "http://192.168.100.25:6051/api/vendedores/";

  const fetchVendedores = async () => {
    try {
        const res = await axios.get<Vendedor[]>(url);
        setVendedores(res.data);
    } catch (error) {
      console.error("Error al obtener vendedores", error);
    }
  };

  useEffect(() => {
    fetchVendedores();
  }, []);

  const handleAddVendedor = async () => {
    try {
      await axios.post(url, newVendedor);
      setNewVendedor({ nombre: "", correo: "", telefono: "" });
      setShowModal(false);
      fetchVendedores();
    } catch (error) {
      console.error("Error al agregar vendedor", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(url + id);
      fetchVendedores();
    } catch (error) {
      console.error("Error al eliminar vendedor", error);
    }
  };

  const handleEdit = (id: string) => {
    const vendedor = vendedores.find((v) => v._id === id);
    if (vendedor) {
      setEditVendedorId(id);
      setEditedVendedor({ ...vendedor });
    }
  };

  const handleSaveEdit = async () => {
    if (editVendedorId && editedVendedor) {
      try {
        await axios.put(url + editVendedorId, editedVendedor);
        setEditVendedorId(null);
        setEditedVendedor(null);
        fetchVendedores();
      } catch (error) {
        console.error("Error al editar vendedor", error);
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between mb-3">
        <Button onClick={() => setShowModal(true)}>Agregar Vendedor</Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {vendedores.map((v) => (
            <tr key={v._id}>
              <td>
                {editVendedorId === v._id ? (
                  <Form.Control
                    value={editedVendedor?.nombre}
                    onChange={(e) => setEditedVendedor({ ...editedVendedor!, nombre: e.target.value })}
                  />
                ) : (
                  v.nombre
                )}
              </td>
              <td>
                {editVendedorId === v._id ? (
                  <Form.Control
                    value={editedVendedor?.correo}
                    onChange={(e) => setEditedVendedor({ ...editedVendedor!, correo: e.target.value })}
                  />
                ) : (
                  v.correo
                )}
              </td>
              <td>
                {editVendedorId === v._id ? (
                  <Form.Control
                    value={editedVendedor?.telefono}
                    onChange={(e) => setEditedVendedor({ ...editedVendedor!, telefono: e.target.value })}
                  />
                ) : (
                  v.telefono
                )}
              </td>
              <td>
                {editVendedorId === v._id ? (
                  <Button variant="primary" onClick={handleSaveEdit}>
                    Guardar
                  </Button>
                ) : (
                  <>
                    <Button variant="warning" className="me-2" onClick={() => handleEdit(v._id!)}>
                      Editar
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(v._id!)}>
                      Eliminar
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal agregar */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Vendedor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              value={newVendedor.nombre}
              onChange={(e) => setNewVendedor({ ...newVendedor, nombre: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Correo</Form.Label>
            <Form.Control
              value={newVendedor.correo}
              onChange={(e) => setNewVendedor({ ...newVendedor, correo: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              value={newVendedor.telefono}
              onChange={(e) => setNewVendedor({ ...newVendedor, telefono: e.target.value })}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleAddVendedor}>
            Agregar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default VendedorList;
