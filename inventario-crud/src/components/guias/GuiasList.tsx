import axios from "axios";
import { useState, useEffect } from "react";
import { Guia } from "../../types";
import SearchBar from "../common/SearchBar";
import DataTable, { DataTableColumn } from "../common/DataTable";
import PaginationCompact from "../common/PaginationCompact";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";
import NotificationConfigModal from "./NotificationConfigModal";
import ExportExcelButton from "../common/ExportExcelButton";
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';

moment.locale('es');

const localizer = momentLocalizer(moment);

// ✅ Este es el objeto de mensajes traducidos
const calendarMessages = {
  date: 'Fecha',
  time: 'Hora',
  event: 'Evento',
  allDay: 'Todo el día',
  week: 'Semana',
  work_week: 'Semana laboral',
  day: 'Día',
  month: 'Mes',
  previous: 'Anterior',
  next: 'Siguiente',
  yesterday: 'Ayer',
  tomorrow: 'Mañana',
  today: 'Hoy',
  agenda: 'Agenda',
  noEventsInRange: 'No hay eventos en este rango.',
  showMore: (total: number) => `+ Ver más (${total})`,
};

const emptyGuia: Guia = {
  numeroGuia: "",
  proveedor: "",
  paqueteria: "",
  fechaPedido: "",
  fechaLlegada: "",
  proyectos: [],
  estado: "no entregado",
  comentarios: "", // Nuevo campo
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
  const [showMovModal, setShowMovModal] = useState(false);
  const [movDesde, setMovDesde] = useState("");
  const [movHasta, setMovHasta] = useState("");
  const [movPage, setMovPage] = useState(1);
  const [movFilterDesde, setMovFilterDesde] = useState("");
  const [movFilterHasta, setMovFilterHasta] = useState("");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<View>('month');
  const itemsPerPage = 10;
  const movsPerPage = 10;

  const urlServer = import.meta.env.VITE_API_URL + "guias/";

  const fetchGuias = async () => {
    try {
      const res = await axios.get<Guia[]>(urlServer);
      // Filtrar guías: no mostrar las entregadas con más de 1 semana (usando fechaPedido)
      const now = new Date();
      const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
      const filtradas = res.data.filter(g => {
        if (g.estado === "entregado" && g.fechaPedido) {
          const fechaPedido = new Date(g.fechaPedido);
          return now.getTime() - fechaPedido.getTime() <= oneWeekMs;
        }
        return g.estado !== "entregado" || !g.fechaPedido; // Mostrar si no es entregado o no tiene fecha de pedido
      });
      setGuias(filtradas);
      setFilteredGuias(filtradas);
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
    { key: "fechaPedido", label: "Fecha Pedido", render: g => g.fechaPedido ? g.fechaPedido.slice(0,10) : "" },
    { key: "fechaLlegada", label: "Fecha Llegada", render: g => g.fechaLlegada ? g.fechaLlegada.slice(0,10) : "" },
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
    { key: "comentarios", label: "Comentarios" }, // Nuevo campo en la tabla
  ];

  // Ordenar guías por fechaPedido (más reciente primero)
  const sortedGuias = [...filteredGuias].sort((a, b) => {
    const fechaA = a.fechaPedido ? new Date(a.fechaPedido).getTime() : (a.fechaLlegada ? new Date(a.fechaLlegada).getTime() : 0);
    const fechaB = b.fechaPedido ? new Date(b.fechaPedido).getTime() : (b.fechaLlegada ? new Date(b.fechaLlegada).getTime() : 0);
    return fechaB - fechaA;
  });

  const totalPages = Math.ceil(sortedGuias.length / itemsPerPage);
  const paginated = sortedGuias.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);

  // Filtrar guías por fechaPedido en el rango seleccionado (usando movFilterDesde/movFilterHasta)
  const guiasFiltradasPorFecha = guias.filter(g => {
    if (!g.fechaPedido) return false;
    const fecha = new Date(g.fechaPedido);
    const desde = movFilterDesde ? new Date(movFilterDesde) : null;
    const hasta = movFilterHasta ? new Date(movFilterHasta) : null;
    if (desde && fecha < desde) return false;
    if (hasta) {
      const hastaFin = new Date(hasta);
      hastaFin.setHours(23,59,59,999);
      if (fecha > hastaFin) return false;
    }
    return true;
  });
  const totalMovPages = Math.ceil(guiasFiltradasPorFecha.length / movsPerPage);
  const paginatedMovs = guiasFiltradasPorFecha.slice((movPage-1)*movsPerPage, movPage*movsPerPage);

  // Eventos para el calendario
  const calendarEvents = filteredGuias.flatMap(g => {
    const events = [];
    // Pedido
    if (g.fechaPedido) {
      events.push({
        title: `Pedido: ${g.numeroGuia}`,
        start: new Date(g.fechaPedido),
        end: new Date(g.fechaPedido),
        allDay: true,
        resource: { tipo: 'pedido', guia: g }
      });
    }
    // Llegada
    if (g.fechaLlegada) {
      events.push({
        title: `Llegada: ${g.numeroGuia}`,
        start: new Date(g.fechaLlegada),
        end: new Date(g.fechaLlegada),
        allDay: true,
        resource: { tipo: 'llegada', guia: g }
      });
    }
    // Atrasado (si está atrasado y no entregado)
    if (g.estado === 'atrasado' && g.fechaPedido) {
      // Mostrar como evento de varios días desde pedido hasta hoy
      events.push({
        title: `Atrasado: ${g.numeroGuia}`,
        start: new Date(g.fechaPedido),
        end: new Date(),
        allDay: true,
        resource: { tipo: 'atrasado', guia: g }
      });
    }
    return events;
  });

  // Colores personalizados para los eventos
  const eventPropGetter = (event: { resource: { tipo: string; }; }) => {
    if (event.resource?.tipo === 'pedido') {
      return { style: { backgroundColor: '#007bff', color: 'white', borderRadius: 6 } };
    }
    if (event.resource?.tipo === 'llegada') {
      return { style: { backgroundColor: '#28a745', color: 'white', borderRadius: 6 } };
    }
    if (event.resource?.tipo === 'atrasado') {
      return { style: { backgroundColor: '#dc3545', color: 'white', borderRadius: 6, border: '2px solid #dc3545' } };
    }
    return {};
  };

  return (
    <div className="container-fluid mt-4 px-1 px-sm-3">
      {/* Buscador y botones arriba, ocupando todo el ancho */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch gap-2">
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
              <Button variant="info" onClick={() => setShowMovModal(true)}>
                Movimientos
              </Button>
              <Button variant="success" onClick={() => { setShowModal(true); setEditId(null); setNewGuia({ ...emptyGuia }); }}>
                Agregar guía
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Tabla y calendario debajo, en dos columnas */}
      <div className="row">
        {/* Tabla (50%) */}
        <div className="col-12 col-lg-6" style={{ flex: '0 0 50%', maxWidth: '50%' }}>
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
        </div>
        {/* Calendario (50%) */}
        <div className="col-12 col-lg-6" style={{ flex: '0 0 50%', maxWidth: '50%' }}>
          <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.03)', padding: 16, height: 'calc(100vh - 270px)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'visible' }}>
            <h5 className="mb-3">Calendario de Paquetes</h5>
            <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'visible' }}>
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                messages={calendarMessages}
                date={calendarDate}
                view={calendarView}
                onView={setCalendarView}
                onNavigate={setCalendarDate}
                eventPropGetter={eventPropGetter}
              />
            </div>
            <div className="mt-3 small">
              <span style={{ background: '#007bff', color: 'white', borderRadius: 4, padding: '2px 8px', marginRight: 8 }}>Pedido</span>
              <span style={{ background: '#28a745', color: 'white', borderRadius: 4, padding: '2px 8px', marginRight: 8 }}>Llegada</span>
              <span style={{ background: '#dc3545', color: 'white', borderRadius: 4, padding: '2px 8px' }}>Atrasado</span>
            </div>
          </div>
        </div>
      </div>
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light border-bottom">
          <Modal.Title>{editId ? "Editar Guía" : "Agregar Guía"}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-3">
          <Form>
            <Row>
              <Col md={4} className="mb-3">
                <Form.Label>Número de guía</Form.Label>
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
                <Form.Label>Fecha de pedido</Form.Label>
                <Form.Control type="date" value={newGuia.fechaPedido ? newGuia.fechaPedido.slice(0,10) : ""} onChange={e => setNewGuia({ ...newGuia, fechaPedido: e.target.value })} />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Fecha de llegada</Form.Label>
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
            <Row>
              <Col md={12} className="mb-3">
                <Form.Label>Comentarios</Form.Label>
                <Form.Control as="textarea" rows={2} value={newGuia.comentarios || ""} onChange={e => setNewGuia({ ...newGuia, comentarios: e.target.value })} />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave}>Guardar</Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showMovModal} onHide={() => setShowMovModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Movimientos de guías</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="mb-3">
            <Col md={5}>
              <Form.Label>Desde</Form.Label>
              <Form.Control type="date" value={movDesde} onChange={e => setMovDesde(e.target.value)} />
            </Col>
            <Col md={5}>
              <Form.Label>Hasta</Form.Label>
              <Form.Control type="date" value={movHasta} onChange={e => setMovHasta(e.target.value)} />
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button variant="primary" className="w-100" onClick={() => { setMovFilterDesde(movDesde); setMovFilterHasta(movHasta); setMovPage(1); }}>Buscar</Button>
            </Col>
          </Row>
          <div className="mb-2 d-flex justify-content-end">
            <ExportExcelButton
              data={guiasFiltradasPorFecha.map(g => ({
                numeroGuia: g.numeroGuia,
                proveedor: g.proveedor,
                paqueteria: g.paqueteria,
                fechaPedido: g.fechaPedido ? new Date(g.fechaPedido).toLocaleDateString() : "",
                fechaLlegada: g.fechaLlegada ? new Date(g.fechaLlegada).toLocaleDateString() : "",
                proyectos: g.proyectos.join(", "),
                estado: g.estado,
                comentarios: g.comentarios || ""
              }))}
              fileName={`guias_movimientos_${movFilterDesde || ""}_${movFilterHasta || ""}.xlsx`}
              sheetName="MovimientosGuias"
              className="mb-2"
            />
          </div>
          <div style={{ maxHeight: 400, overflowY: 'auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <DataTable
              columns={[
                { key: "numeroGuia", label: "Núm. guía" },
                { key: "proveedor", label: "Proveedor" },
                { key: "paqueteria", label: "Paquetería" },
                { key: "fechaPedido", label: "Fecha de pedido" },
                { key: "fechaLlegada", label: "Fecha de llegada" },
                { key: "proyectos", label: "Proyectos" },
                { key: "estado", label: "Estado" },
                { key: "comentarios", label: "Comentarios" },
              ]}
              data={paginatedMovs.map(g => ({
                ...g,
                fechaPedido: g.fechaPedido ? new Date(g.fechaPedido).toLocaleDateString() : "",
                fechaLlegada: g.fechaLlegada ? new Date(g.fechaLlegada).toLocaleDateString() : "",
                proyectos: g.proyectos.join(", ")
              }))}
              className="small"
            />
          </div>
          <div className="d-flex justify-content-center my-3">
            <PaginationCompact currentPage={movPage} totalPages={totalMovPages} onPageChange={setMovPage} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMovModal(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
      <NotificationConfigModal show={showNotifConfig} onHide={() => setShowNotifConfig(false)} />
    </div>
  );
};

export default GuiasList;