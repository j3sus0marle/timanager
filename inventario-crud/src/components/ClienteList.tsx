import { useEffect, useState } from "react";
import axios from "axios";
import { Button, Table, Modal, Form, Col, Row } from "react-bootstrap";

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
  const [editedCliente, setEditedCliente] = useState<Cliente | null>(null);

  const url = "http://192.168.100.25:6051/api/clientes/";

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

  const handleEdit = (id: string) => {
    const cliente = clientes.find((c) => c._id === id);
    if (cliente) {
      setEditedCliente({ ...cliente });
    }
  };

  const handleSaveEdit = async () => {
    if (!editedCliente) return;

    try {
      if (editedCliente._id) {
        // Editar cliente existente
        await axios.put(url + editedCliente._id, editedCliente);
      } else {
        // Agregar nuevo cliente
        await axios.post(url, editedCliente);
      }
      setEditedCliente(null);
      fetchClientes();
    } catch (error) {
      console.error("Error al guardar cliente", error);
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
        <Button onClick={() => setEditedCliente({ compania: "", direccion: "", personas: [] })}>
          Agregar Cliente
        </Button>
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

      {/* Modal único para agregar y editar */}
      <Modal show={!!editedCliente} onHide={() => setEditedCliente(null)} size="lg" centered>
        <Modal.Header closeButton className="bg-light border-bottom">
          <Modal.Title className="">
            {editedCliente?._id ? "Editar Cliente" : "Agregar Cliente"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="px-4 py-3">
          {editedCliente && (
            <>
              {/* Datos de la compañía */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Compañía</Form.Label>
                    <Form.Control
                      value={editedCliente.compania}
                      onChange={(e) =>
                        setEditedCliente({ ...editedCliente, compania: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Dirección</Form.Label>
                    <Form.Control
                      value={editedCliente.direccion}
                      onChange={(e) =>
                        setEditedCliente({ ...editedCliente, direccion: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Contactos */}
              <div className="border-top pt-3 mt-3">
                <h5 className="fw-bold text-secondary mb-3">
                  <i className="bi bi-person-lines-fill me-2"></i>Contacto
                </h5>

                {editedCliente.personas.map((p, index) => (
                  <div
                    key={index}
                    className="mb-4 p-3 border rounded bg-light position-relative"
                  >
                    <Row>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Nombre</Form.Label>
                          <Form.Control
                            value={p.nombre}
                            onChange={(e) =>
                              handlePersonaChange(index, "nombre", e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Correo</Form.Label>
                          <Form.Control
                            type="email"
                            value={p.correo}
                            onChange={(e) =>
                              handlePersonaChange(index, "correo", e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Teléfono</Form.Label>
                          <Form.Control
                            value={p.telefono}
                            onChange={(e) =>
                              handlePersonaChange(index, "telefono", e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="position-absolute top-0 end-0 m-2"
                      onClick={() => handleRemovePersona(index)}
                    >
                      <i className="bi bi-x-circle">x</i>
                    </Button>
                  </div>
                ))}

                <Button
                  variant="outline-primary"
                  size="sm"
                  className="mb-2"
                  onClick={handleAddPersona}
                >
                  <i className="bi bi-person-plus me-2"></i>Agregar Persona
                </Button>
              </div>
            </>
          )}
        </Modal.Body>

        <Modal.Footer className="bg-light border-top">
          <Button variant="outline-secondary" onClick={() => setEditedCliente(null)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleSaveEdit}>
            <i className="bi bi-check-circle me-2"></i>
            {editedCliente?._id ? "Guardar Cambios" : "Agregar Cliente"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ClienteList;
