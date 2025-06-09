import axios from "axios";
import { useState, useEffect } from "react";
import { Cliente, IContacto } from "../../types";
import SearchBar from "../common/SearchBar";
import DataTable, { DataTableColumn } from "../common/DataTable";
import PaginationCompact from "../common/PaginationCompact";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";


const emptyContacto: IContacto = { nombre: "", puesto: "", contacto: { correo: "", telefono: "", extension: "" } };
const emptyCliente: Cliente = { nombreEmpresa: "", direccion: "", telefono: "", contactos: [ { ...emptyContacto } ] };


const ClienteList: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [newCliente, setNewCliente] = useState<Cliente>({ ...emptyCliente });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const urlServer = import.meta.env.VITE_API_URL + "clientes/";

  const fetchClientes = async () => {
    try {
      const res = await axios.get<Cliente[]>(urlServer);
      setClientes(res.data);
      setFilteredClientes(res.data);
    } catch (err) {
      setClientes([]);
      setFilteredClientes([]);
    }
  };

  useEffect(() => { fetchClientes(); }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term) setFilteredClientes(clientes);
    else {
      const lower = term.toLowerCase();
      setFilteredClientes(clientes.filter(c =>
        c.nombreEmpresa.toLowerCase().includes(lower) ||
        c.direccion.toLowerCase().includes(lower) ||
        c.contactos.some(p =>
          p.nombre.toLowerCase().includes(lower) ||
          p.puesto.toLowerCase().includes(lower) ||
          p.contacto.correo.toLowerCase().includes(lower) ||
          p.contacto.telefono.toLowerCase().includes(lower) ||
          (p.contacto.extension || "").toLowerCase().includes(lower)
        )
      ));
    }
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await axios.put(urlServer + editId, newCliente);
      } else {
        await axios.post(urlServer, newCliente);
      }
      setShowModal(false);
      setNewCliente({ ...emptyCliente });
      setEditId(null);
      fetchClientes();
    } catch (err) { }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar cliente?")) return;
    try {
      await axios.delete(urlServer + id);
      fetchClientes();
    } catch (err) { }
  };

  const handleEdit = (cliente: Cliente) => {
    setEditId(cliente._id || null);
    setNewCliente({ ...cliente, contactos: cliente.contactos.map(p => ({ ...p, contacto: { ...p.contacto } })) });
    setShowModal(true);
  };

  const handleAddContacto = () => {
    setNewCliente({ ...newCliente, contactos: [...newCliente.contactos, { ...emptyContacto }] });
  };
  const handleRemoveContacto = (idx: number) => {
    setNewCliente({ ...newCliente, contactos: newCliente.contactos.filter((_, i) => i !== idx) });
  };

  const columns: DataTableColumn<Cliente>[] = [
    { key: "nombreEmpresa", label: "Empresa" },
    { key: "direccion", label: "Dirección" },
    { key: "telefono", label: "Teléfono" },
    { key: "contactos", label: "Contactos", render: (c) => (
      <ul className="mb-0 ps-3">
        {c.contactos.map((p, i) => (
          <li key={i}><b>{p.nombre}</b> ({p.puesto})<br/>{p.contacto.correo}, {p.contacto.telefono}{p.contacto.extension ? `, ext. ${p.contacto.extension}` : ""}</li>
        ))}
      </ul>
    ) },
  ];

  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);
  const paginated = filteredClientes.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);


  return (
    <div className="container-fluid mt-4 px-1 px-sm-3">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch gap-2 mb-3">
        <SearchBar
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Buscar por empresa, dirección o contacto..."
          className="flex-grow-1"
        />
        <Button variant="success" onClick={() => { setShowModal(true); setEditId(null); setNewCliente({ ...emptyCliente }); }}>
          Agregar Cliente
        </Button>
      </div>
      <div className="table-responsive" style={{ minHeight: `calc(100vh - 270px)`, maxHeight: `calc(100vh - 270px)`, overflowY: "auto", background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
        <DataTable
          columns={columns}
          data={paginated}
          actions={(cliente) => (
            <div className="d-flex flex-column flex-sm-row align-items-stretch gap-1">
              <Button variant="warning" size="sm" className="w-100 w-sm-auto" onClick={() => handleEdit(cliente)}>Editar</Button>
              <Button variant="danger" size="sm" className="w-100 w-sm-auto" onClick={() => handleDelete(cliente._id!)}>Eliminar</Button>
            </div>
          )}
          className="small"
          style={{ marginBottom: 0 }}
        />
      </div>
      <div className="d-flex justify-content-center my-3">
        <PaginationCompact currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light border-bottom">
          <Modal.Title>{editId ? "Editar Cliente" : "Agregar Cliente"}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-3">
          <Form>
            <Row>
              <Col md={4} className="mb-3">
                <Form.Label>Empresa</Form.Label>
                <Form.Control type="text" value={newCliente.nombreEmpresa} onChange={e => setNewCliente({ ...newCliente, nombreEmpresa: e.target.value })} />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label>Dirección</Form.Label>
                <Form.Control type="text" value={newCliente.direccion} onChange={e => setNewCliente({ ...newCliente, direccion: e.target.value })} />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control type="text" value={newCliente.telefono} onChange={e => setNewCliente({ ...newCliente, telefono: e.target.value })} />
              </Col>
            </Row>
            <Form.Label>Contactos</Form.Label>
            {newCliente.contactos.map((p, idx) => (
              <div key={idx} className="mb-2">
                <Row className="align-items-end">
                  <Col md={6} sm={6} xs={12} className="mb-2 mb-md-0">
                    <Form.Control type="text" placeholder="Nombre" value={p.nombre} onChange={e => setNewCliente({ ...newCliente, contactos: newCliente.contactos.map((x, i) => i === idx ? { ...x, nombre: e.target.value } : x) })} />
                  </Col>
                  <Col md={5} sm={5} xs={10} className="mb-2 mb-md-0">
                    <Form.Control type="text" placeholder="Puesto" value={p.puesto} onChange={e => setNewCliente({ ...newCliente, contactos: newCliente.contactos.map((x, i) => i === idx ? { ...x, puesto: e.target.value } : x) })} />
                  </Col>
                  <Col md={1} sm={1} xs={2} className="text-end mb-2 mb-md-0 d-flex align-items-center justify-content-end">
                    <Button variant="outline-danger" size="sm" onClick={() => handleRemoveContacto(idx)}>-</Button>
                  </Col>
                </Row>
                <Row className="align-items-end mt-2">
                  <Col md={4} sm={12} xs={12} className="mb-2 mb-md-0">
                    <Form.Control type="email" placeholder="Correo" value={p.contacto.correo} onChange={e => setNewCliente({ ...newCliente, contactos: newCliente.contactos.map((x, i) => i === idx ? { ...x, contacto: { ...x.contacto, correo: e.target.value } } : x) })} />
                  </Col>
                  <Col md={4} sm={6} xs={6} className="mb-2 mb-md-0">
                    <Form.Control type="text" placeholder="Teléfono" value={p.contacto.telefono} onChange={e => setNewCliente({ ...newCliente, contactos: newCliente.contactos.map((x, i) => i === idx ? { ...x, contacto: { ...x.contacto, telefono: e.target.value } } : x) })} />
                  </Col>
                  <Col md={4} sm={6} xs={6} className="mb-2 mb-md-0">
                    <Form.Control type="text" placeholder="Ext" value={p.contacto.extension || ""} onChange={e => setNewCliente({ ...newCliente, contactos: newCliente.contactos.map((x, i) => i === idx ? { ...x, contacto: { ...x.contacto, extension: e.target.value } } : x) })} />
                  </Col>
                </Row>
              </div>
            ))}
            <Button variant="outline-primary" size="sm" className="mt-2" onClick={handleAddContacto}>Agregar Contacto</Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave}>Guardar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};


export default ClienteList;
