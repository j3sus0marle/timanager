import axios from "axios";
import { useState, useEffect } from "react";
import { Vendedor } from "../../types";
import SearchBar from "../common/SearchBar";
import DataTable, { DataTableColumn } from "../common/DataTable";
import PaginationCompact from "../common/PaginationCompact";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";

const emptyVendedor: Vendedor = { nombre: "", correo: "", telefono: "" };

const VendedorList: React.FC = () => {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [filteredVendedores, setFilteredVendedores] = useState<Vendedor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [newVendedor, setNewVendedor] = useState<Vendedor>({ ...emptyVendedor });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const urlServer = import.meta.env.VITE_API_URL + "vendedores/";

  const fetchVendedores = async () => {
    try {
      const res = await axios.get<Vendedor[]>(urlServer);
      setVendedores(res.data);
      setFilteredVendedores(res.data);
    } catch (err) {
      setVendedores([]);
      setFilteredVendedores([]);
    }
  };

  useEffect(() => { fetchVendedores(); }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term) setFilteredVendedores(vendedores);
    else {
      const lower = term.toLowerCase();
      setFilteredVendedores(vendedores.filter(v =>
        v.nombre.toLowerCase().includes(lower) ||
        v.correo.toLowerCase().includes(lower) ||
        v.telefono.toLowerCase().includes(lower)
      ));
    }
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await axios.put(urlServer + editId, newVendedor);
      } else {
        await axios.post(urlServer, newVendedor);
      }
      setShowModal(false);
      setNewVendedor({ ...emptyVendedor });
      setEditId(null);
      fetchVendedores();
    } catch (err) { }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar vendedor?")) return;
    try {
      await axios.delete(urlServer + id);
      fetchVendedores();
    } catch (err) { }
  };

  const handleEdit = (vendedor: Vendedor) => {
    setEditId(vendedor._id || null);
    setNewVendedor({ ...vendedor });
    setShowModal(true);
  };

  const columns: DataTableColumn<Vendedor>[] = [
    { key: "nombre", label: "Nombre" },
    { key: "correo", label: "Correo" },
    { key: "telefono", label: "Teléfono" },
  ];

  const totalPages = Math.ceil(filteredVendedores.length / itemsPerPage);
  const paginated = filteredVendedores.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);

  return (
    <div className="container-fluid mt-4 px-1 px-sm-3">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch gap-2 mb-3">
        <SearchBar
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Buscar por nombre, correo o teléfono..."
          className="flex-grow-1"
        />
        <Button variant="success" onClick={() => { setShowModal(true); setEditId(null); setNewVendedor({ ...emptyVendedor }); }}>
          Agregar Vendedor
        </Button>
      </div>
      <div className="table-responsive" style={{ minHeight: `calc(100vh - 270px)`, maxHeight: `calc(100vh - 270px)`, overflowY: "auto", background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
        <DataTable
          columns={columns}
          data={paginated}
          actions={(vendedor) => (
            <div className="d-flex flex-column flex-sm-row align-items-stretch gap-1">
              <Button variant="warning" size="sm" className="w-100 w-sm-auto" onClick={() => handleEdit(vendedor)}>Editar</Button>
              <Button variant="danger" size="sm" className="w-100 w-sm-auto" onClick={() => handleDelete(vendedor._id!)}>Eliminar</Button>
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
          <Modal.Title>{editId ? "Editar Vendedor" : "Agregar Vendedor"}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-3">
          <Form>
            <Row>
              <Col md={4} className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control 
                  type="text" 
                  value={newVendedor.nombre} 
                  onChange={e => setNewVendedor({ ...newVendedor, nombre: e.target.value })} 
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label>Correo</Form.Label>
                <Form.Control 
                  type="email" 
                  value={newVendedor.correo} 
                  onChange={e => setNewVendedor({ ...newVendedor, correo: e.target.value })} 
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control 
                  type="text" 
                  value={newVendedor.telefono} 
                  onChange={e => setNewVendedor({ ...newVendedor, telefono: e.target.value })} 
                />
              </Col>
            </Row>
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

export default VendedorList;
