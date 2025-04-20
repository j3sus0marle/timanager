import { useEffect, useState } from "react";
import axios from "axios";
import { Button, Table, Modal, Form } from "react-bootstrap";

interface Persona {
  nombre: string;
  correo: string;
  telefono: string;
}

interface Cliente {
  _id?: string;
  compania: string;
  direccion: string;
  personas: Persona[];
}

const ClienteList: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newCliente, setNewCliente] = useState<Cliente>({ compania: "", direccion: "", personas: [] });
  const [editClienteId, setEditClienteId] = useState<string | null>(null);
  const [editedCliente, setEditedCliente] = useState<Cliente | null>(null);

  const url = "http://localhost:6051/api/clientes/";

  const fetchClientes = async () => {
    try {
      const res = await axios.get<Cliente[]>(url);
      setClientes(res.data);
    } catch (error) {
      console.error("Error al obtener clientes", error);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleAddCliente = async () => {
    try {
      await axios.post(url, newCliente);
      setNewCliente({ compania: "", direccion: "", personas: [] });
      setShowModal(false);
      fetchClientes();
    } catch (error) {
      console.error("Error al agregar cliente", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(url + id);
      fetchClientes();
    } catch (error) {
      console.error("Error al eliminar cliente", error);
    }
  };

  const handleEdit = (id: string) => {
    const cliente = clientes.find((c) => c._id === id);
    if (cliente) {
      setEditClienteId(id);
      setEditedCliente({ ...cliente });
    }
  };

  const handleSaveEdit = async () => {
    if (editClienteId && editedCliente) {
      try {
        await axios.put(url + editClienteId, editedCliente);
        setEditClienteId(null);
        setEditedCliente(null);
        fetchClientes();
      } catch (error) {
        console.error("Error al editar cliente", error);
      }
    }
  };

  const handleAddPersona = () => {
    if (editedCliente) {
      setEditedCliente({
        ...editedCliente,
        personas: [...editedCliente.personas, { nombre: "", correo: "", telefono: "" }],
      });
    }
  };

  const handlePersonaChange = (index: number, field: keyof Persona, value: string) => {
    if (editedCliente) {
      const updatedPersonas = editedCliente.personas.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      );
      setEditedCliente({ ...editedCliente, personas: updatedPersonas });
    }
  };

  const handleRemovePersona = (index: number) => {
    if (editedCliente) {
      const updatedPersonas = editedCliente.personas.filter((_, i) => i !== index);
      setEditedCliente({ ...editedCliente, personas: updatedPersonas });
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between mb-3">
        <Button onClick={() => setShowModal(true)}>Agregar Cliente</Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Compañía</th>
            <th>Dirección</th>
            <th>Contacto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c._id}>
              <td>{c.compania}</td>
              <td>{c.direccion}</td>
              <td>
                <ul>
                  {c.personas.map((p, idx) => (
                    <li key={idx}>{`${p.nombre} (${p.correo}, ${p.telefono})`}</li>
                  ))}
                </ul>
              </td>
              <td>
                <Button variant="warning" className="me-2" onClick={() => handleEdit(c._id!)}>
                  Editar
                </Button>
                <Button variant="danger" onClick={() => handleDelete(c._id!)}>
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal de edición */}
      <Modal show={!!editedCliente} onHide={() => setEditedCliente(null)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Editar Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editedCliente && (
            <>
              <Form.Group className="mb-2">
                <Form.Label>Compañía</Form.Label>
                <Form.Control
                  value={editedCliente.compania}
                  onChange={(e) => setEditedCliente({ ...editedCliente, compania: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Dirección</Form.Label>
                <Form.Control
                  value={editedCliente.direccion}
                  onChange={(e) => setEditedCliente({ ...editedCliente, direccion: e.target.value })}
                />
              </Form.Group>
              <hr />
              <h5>Contacto</h5>
              {editedCliente.personas.map((p, index) => (
                <div key={index} className="mb-3 border rounded p-2">
                  <Form.Group className="mb-1">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                      value={p.nombre}
                      onChange={(e) => handlePersonaChange(index, "nombre", e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-1">
                    <Form.Label>Correo</Form.Label>
                    <Form.Control
                      value={p.correo}
                      onChange={(e) => handlePersonaChange(index, "correo", e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-1">
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control
                      value={p.telefono}
                      onChange={(e) => handlePersonaChange(index, "telefono", e.target.value)}
                    />
                  </Form.Group>
                  <Button variant="danger" size="sm" onClick={() => handleRemovePersona(index)}>
                    Eliminar Persona
                  </Button>
                </div>
              ))}
              <Button variant="secondary" onClick={handleAddPersona}>Agregar Persona</Button>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditedCliente(null)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleSaveEdit}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para nuevo cliente */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Agregar Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Compañía</Form.Label>
            <Form.Control
              value={newCliente.compania}
              onChange={(e) => setNewCliente({ ...newCliente, compania: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Dirección</Form.Label>
            <Form.Control
              value={newCliente.direccion}
              onChange={(e) => setNewCliente({ ...newCliente, direccion: e.target.value })}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleAddCliente}>
            Agregar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ClienteList;
