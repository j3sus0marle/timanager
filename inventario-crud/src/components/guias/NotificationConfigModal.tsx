import { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col, InputGroup } from "react-bootstrap";
import axios from "axios";

interface NotificationConfig {
  emails: string[];
  notifyOneDayBefore: boolean;
  notifyOnDeliveryDay: boolean;
  notifyWhenLate: boolean;
  lateFrequencyDays: number;
}

const defaultConfig: NotificationConfig = {
  emails: [],
  notifyOneDayBefore: true,
  notifyOnDeliveryDay: true,
  notifyWhenLate: true,
  lateFrequencyDays: 1,
};

interface Props {
  show: boolean;
  onHide: () => void;
}

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") + "/";

const NotificationConfigModal: React.FC<Props> = ({ show, onHide }) => {
  const [config, setConfig] = useState<NotificationConfig>(defaultConfig);
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      setLoading(true);
      axios.get<NotificationConfig>(API_URL + "notification-config")
        .then(res => setConfig({
          ...defaultConfig,
          ...res.data,
          emails: Array.isArray(res.data.emails) ? res.data.emails : [],
        }))
        .catch(() => setConfig(defaultConfig))
        .then(() => setLoading(false));
    }
  }, [show]);

  const addEmail = () => {
    const email = emailInput.trim();
    if (email && Array.isArray(config.emails) && !config.emails.includes(email)) {
      setConfig({ ...config, emails: [...config.emails, email] });
      setEmailInput("");
    }
  };

  const removeEmail = (email: string) => {
    setConfig({ ...config, emails: config.emails.filter(e => e !== email) });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await axios.post(API_URL + "notification-config", config);
      onHide();
    } catch (err) {
      setError("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      // Enviar variable de entorno temporal para forzar notificación entre fechas
      await axios.post(API_URL + "notificar-guias", {}, { headers: { 'X-Force-Notify-Between': '1' } });
      setTestResult("Notificación de prueba enviada (si hay paquetes entre fechas de pedido y llegada).");
    } catch (err) {
      setTestResult("Error al enviar notificación de prueba");
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Configuración de Notificaciones</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div>Cargando...</div>
        ) : (
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Correos electrónicos a notificar</Form.Label>
              <InputGroup>
                <Form.Control
                  type="email"
                  placeholder="Agregar correo"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addEmail(); } }}
                />
                <Button variant="outline-primary" onClick={addEmail}>Agregar</Button>
              </InputGroup>
              <div className="mt-2">
                {(config.emails || []).map(email => (
                  <span key={email} className="badge bg-secondary me-2">
                    {email} <span style={{ cursor: "pointer" }} onClick={() => removeEmail(email)}>&times;</span>
                  </span>
                ))}
              </div>
            </Form.Group>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Notificar un día antes de la llegada"
                  checked={config.notifyOneDayBefore}
                  onChange={e => setConfig({ ...config, notifyOneDayBefore: e.target.checked })}
                />
                <Form.Check
                  type="checkbox"
                  label="Notificar el mismo día de la llegada"
                  checked={config.notifyOnDeliveryDay}
                  onChange={e => setConfig({ ...config, notifyOnDeliveryDay: e.target.checked })}
                />
                <Form.Check
                  type="checkbox"
                  label="Notificar cuando esté atrasado"
                  checked={config.notifyWhenLate}
                  onChange={e => setConfig({ ...config, notifyWhenLate: e.target.checked })}
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Frecuencia de notificación si está atrasado (días)</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  value={config.lateFrequencyDays}
                  onChange={e => setConfig({ ...config, lateFrequencyDays: Number(e.target.value) })}
                  disabled={!config.notifyWhenLate}
                />
              </Col>
            </Row>
            {error && <div className="text-danger">{error}</div>}
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="info" onClick={handleTestNotification} disabled={testLoading} style={{marginRight:8}}>
          {testLoading ? "Enviando..." : "Probar notificación"}
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>Guardar</Button>
      </Modal.Footer>
      {testResult && <div className="text-center text-info mb-2">{testResult}</div>}
    </Modal>
  );
};

export default NotificationConfigModal;
