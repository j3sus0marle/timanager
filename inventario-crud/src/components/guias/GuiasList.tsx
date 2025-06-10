import axios from "axios";
import { useState, useEffect } from "react";
import { Guia } from "../../types";
import SearchBar from "../common/SearchBar";
import DataTable, { DataTableColumn } from "../common/DataTable";
import PaginationCompact from "../common/PaginationCompact";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";
import NotificationConfigModal from "./NotificationConfigModal";

const emptyGuia: Guia = {
  numeroGuia: "",
  proveedor: "",
  paqueteria: "",
  fechaPedido: "",
  fechaLlegada: "",
  proyectos: [],
  estado: "no entregado",
};

const GuiasList: React.FC = () => {
  const [guias, setGuias] = useState<Guia[]>([]);
  const [filteredGuias, setFilteredGuias] = useState<Guia[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [newGuia, setNewGuia] = useState<Guia>({ ...emptyGuia });
  const [currentPage, setCurrentPage] = useState(1);
  const [showNotifConfig, setShowNotifConfig] = useState(false);
  const itemsPerPage = 10;

  const urlServer = import.meta.env.VITE_API_URL + "guias/";

  const fetchGuias = async () => {
    try {
      const res = await axios.get<Guia[]>(urlServer);
      setGuias(res.data);
      setFilteredGuias(res.data);
    } catch (err) {
      setGuias([]);
      setFilteredGuias([]);
    }
  };

  useEffect(() => { fetchGuias(); }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term) setFilteredGuias(guias);
    else {
      const lower = term.toLowerCase();
      setFilteredGuias(guias.filter(g =>
        g.numeroGuia.toLowerCase().includes(lower) ||
        g.proveedor.toLowerCase().includes(lower) ||
        g.paqueteria.toLowerCase().includes(lower) ||
        g.proyectos.some(p => p.toLowerCase().includes(lower)) ||
        g.estado.toLowerCase().includes(lower)
      ));
    }
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await axios.put(urlServer + editId, newGuia);
      } else {
        await axios.post(urlServer, newGuia);
      }
      setShowModal(false);
      setNewGuia({ ...emptyGuia });
      setEditId(null);
      fetchGuias();
    } catch (err) { }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar guía?")) return;
    try {
      await axios.delete(urlServer + id);
      fetchGuias();
    } catch (err) { }
  };

  const handleEdit = (guia: Guia) => {
    setEditId(guia._id || null);
    setNewGuia({ ...guia, proyectos: [...guia.proyectos] });
    setShowModal(true);
  };

  const columns: DataTableColumn<Guia>[] = [
    { key: "numeroGuia", label: "Núm. Guía" },
    { key: "proveedor", label: "Proveedor" },
    { key: "paqueteria", label: "Paquetería" },
    { key: "fechaPedido", label: "Fecha Pedido", render: g => g.fechaPedido ? new Date(g.fechaPedido).toLocaleDateString() : "" },
    { key: "fechaLlegada", label: "Fecha Llegada", render: g => g.fechaLlegada ? new Date(g.fechaLlegada).toLocaleDateString() : "" },
    { key: "proyectos", label: "Proyectos", render: g => g.proyectos.join(", ") },
    { key: "estado", label: "Estado", render: g => {
      switch (g.estado) {
        case "entregado": return "Entregado";
        case "no entregado": return "No entregado";
        case "en transito": return "En tránsito";
        case "atrasado": return "Atrasado";
        default: return g.estado;
      }
    } },
  ];

  const totalPages = Math.ceil(filteredGuias.length / itemsPerPage);
  const paginated = filteredGuias.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);

  return (
    <div className="container-fluid mt-4 px-1 px-sm-3">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch gap-2 mb-3">
        <SearchBar
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Buscar por número, proveedor, paquetería, proyecto o estado..."
          className="flex-grow-1"
        />
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={() => setShowNotifConfig(true)} title="Configurar notificaciones">
            <i className="bi bi-gear"></i> Notificaciones
          </Button>
          <Button variant="success" onClick={() => { setShowModal(true); setEditId(null); setNewGuia({ ...emptyGuia }); }}>
            Agregar Guía
          </Button>
        </div>
      </div>
      <div className="table-responsive" style={{ minHeight: `calc(100vh - 270px)`, maxHeight: `calc(100vh - 270px)`, overflowY: "auto", background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
        <DataTable
          columns={columns}
          data={paginated}
          actions={(guia) => (
            <div className="d-flex flex-column flex-sm-row align-items-stretch gap-1">
              <Button variant="warning" size="sm" className="w-100 w-sm-auto" onClick={() => handleEdit(guia)}>Editar</Button>
              <Button variant="danger" size="sm" className="w-100 w-sm-auto" onClick={() => handleDelete(guia._id!)}>Eliminar</Button>
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
          <Modal.Title>{editId ? "Editar Guía" : "Agregar Guía"}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-3">
          <Form>
            <Row>
              <Col md={4} className="mb-3">
                <Form.Label>Número de Guía</Form.Label>
                <Form.Control type="text" value={newGuia.numeroGuia} onChange={e => setNewGuia({ ...newGuia, numeroGuia: e.target.value })} />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label>Proveedor</Form.Label>
                <Form.Control type="text" value={newGuia.proveedor} onChange={e => setNewGuia({ ...newGuia, proveedor: e.target.value })} />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label>Paquetería</Form.Label>
                <Form.Control type="text" value={newGuia.paqueteria} onChange={e => setNewGuia({ ...newGuia, paqueteria: e.target.value })} />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>Fecha de Pedido</Form.Label>
                <Form.Control type="date" value={newGuia.fechaPedido ? newGuia.fechaPedido.slice(0,10) : ""} onChange={e => setNewGuia({ ...newGuia, fechaPedido: e.target.value })} />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Fecha de Llegada</Form.Label>
                <Form.Control type="date" value={newGuia.fechaLlegada ? newGuia.fechaLlegada.slice(0,10) : ""} onChange={e => setNewGuia({ ...newGuia, fechaLlegada: e.target.value })} />
              </Col>
            </Row>
            <Row>
              <Col md={8} className="mb-3">
                <Form.Label>Proyectos (IDs separados por coma)</Form.Label>
                <Form.Control as="textarea" rows={1} type="text" value={newGuia.proyectos.join(", ")} onChange={e => setNewGuia({ ...newGuia, proyectos: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Select value={newGuia.estado} onChange={e => setNewGuia({ ...newGuia, estado: e.target.value as Guia["estado"] })}>
                  <option value="entregado">Entregado</option>
                  <option value="no entregado">No entregado</option>
                  <option value="en transito">En tránsito</option>
                  <option value="atrasado">Atrasado</option>
                </Form.Select>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave}>Guardar</Button>
        </Modal.Footer>
      </Modal>
      <NotificationConfigModal show={showNotifConfig} onHide={() => setShowNotifConfig(false)} />
    </div>
  );
};

export default GuiasList;