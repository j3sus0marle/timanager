import React, { useMemo, useState } from "react";
import { Modal, Form, Button, Row, Col, Alert, Badge, Spinner } from "react-bootstrap";

interface ModalResultadosProps {
  show: boolean;
  errorProcesamiento: string | null;
  datosOrdenCompletos: any;
  productosEditables: any[];
  totalesCalculados: {
    subTotal: number;
    iva: number;
    total: number;
  };
  onActualizarProducto: (index: number, campo: string, valor: any) => void;
  onAgregarProducto: () => void;
  onVolverAlFormulario: () => void;
  onGenerarOrden?: (datosOrden: any) => Promise<void>;
  editId?: string | null; // Añadido para identificar si está en modo edición
  onCancelar?: () => void; // Nueva prop para manejar cancelación
}

// Tipos de moneda disponibles
const MONEDAS = {
  MXN: { codigo: 'MXN', nombre: 'Pesos Mexicanos', simbolo: '$', locale: 'es-MX' },
  USD: { codigo: 'USD', nombre: 'Dólares Estadounidenses', simbolo: '$', locale: 'en-US' }
};

// Opciones de porcentaje de IVA disponibles (simbólicas para el PDF)
const PORCENTAJES_IVA = {
  '0': { valor: '0', nombre: '0% (Exento)' },
  '8': { valor: '8', nombre: '8% (Frontera)' },
  '16': { valor: '16', nombre: '16% (General)' }
};

// Componente optimizado para fila de producto individual
const FilaProducto = React.memo(({ 
  producto, 
  index, 
  onActualizar,
  moneda
}: { 
  producto: any, 
  index: number, 
  onActualizar: (index: number, campo: string, valor: any) => void,
  moneda: string
}) => {
  const importe = useMemo(() => {
    return (Number(producto.cantidad) || 0) * (Number(producto.precioUnitario) || 0);
  }, [producto.cantidad, producto.precioUnitario]);

  const formatearMoneda = (valor: number) => {
    const monedaInfo = MONEDAS[moneda as keyof typeof MONEDAS];
    return `${monedaInfo.simbolo}${valor.toLocaleString(monedaInfo.locale, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })} ${monedaInfo.codigo}`;
  };
  
  return (
    <tr>
      <td className="align-middle">
        <Badge bg="secondary">{index + 1}</Badge>
      </td>
      <td className="align-middle">
        <Form.Control
          type="text"
          size="sm"
          value={producto.clave || ''}
          onChange={(e) => onActualizar(index, 'clave', e.target.value)}
          placeholder="Código"
        />
      </td>
      <td className="align-middle">
        <Form.Control
          as="textarea"
          rows={2}
          size="sm"
          value={producto.descripcion || ''}
          onChange={(e) => onActualizar(index, 'descripcion', e.target.value)}
          placeholder="Descripción del producto"
        />
      </td>
      <td className="align-middle">
        <Form.Control
          type="number"
          size="sm"
          value={producto.cantidad || ''}
          onChange={(e) => onActualizar(index, 'cantidad', parseFloat(e.target.value) || 0)}
          placeholder="0"
          min="0"
          step="0.01"
        />
      </td>
      <td className="align-middle">
        <Form.Control
          type="text"
          size="sm"
          value={producto.unidad || ''}
          onChange={(e) => onActualizar(index, 'unidad', e.target.value)}
          placeholder="Unidad"
        />
      </td>
      <td className="align-middle">
        <Form.Control
          type="number"
          size="sm"
          value={producto.precioUnitario || ''}
          onChange={(e) => onActualizar(index, 'precioUnitario', parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          min="0"
          step="0.01"
        />
      </td>
      <td className="align-middle">
        <div className="fw-bold text-end">
          {formatearMoneda(importe)}
        </div>
      </td>
    </tr>
  );
});

FilaProducto.displayName = 'FilaProducto';

// Componente optimizado para los totales
const ComponenteTotales = React.memo(({ 
  totales, 
  moneda,
  porcentajeIvaSimbolico 
}: { 
  totales: any, 
  moneda: string,
  porcentajeIvaSimbolico?: string
}) => {
  const porcentajeIva = useMemo(() => {
    // Si se proporciona un porcentaje simbólico, usarlo; sino calcular desde los totales
    if (porcentajeIvaSimbolico) {
      return porcentajeIvaSimbolico;
    }
    if (totales.subTotal > 0 && totales.iva > 0) {
      return ((totales.iva / totales.subTotal) * 100).toFixed(1);
    }
    return '16.0';
  }, [totales.subTotal, totales.iva, porcentajeIvaSimbolico]);

  const formatearMoneda = (valor: number) => {
    const monedaInfo = MONEDAS[moneda as keyof typeof MONEDAS];
    return `${monedaInfo.simbolo}${valor.toLocaleString(monedaInfo.locale, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })} ${monedaInfo.codigo}`;
  };

  return (
    <div className="card">
      <div className="card-header bg-light">
        <h6 className="mb-0">
          <i className="fas fa-calculator me-2"></i>
          Totales de la Orden
        </h6>
      </div>
      <div className="card-body">
        <Row className="mb-2">
          <Col xs={6} className="fw-bold">Subtotal:</Col>
          <Col xs={6} className="text-end">
            <Form.Control
              type="text"
              size="sm"
              value={formatearMoneda(totales.subTotal)}
              readOnly
              className="text-end fw-bold border-0 bg-light"
            />
          </Col>
        </Row>
        <Row className="mb-2">
          <Col xs={6} className="fw-bold">
            IVA ({porcentajeIva}%):
          </Col>
          <Col xs={6} className="text-end">
            <Form.Control
              type="text"
              size="sm"
              value={formatearMoneda(totales.iva)}
              readOnly
              className="text-end fw-bold border-0 bg-light"
            />
          </Col>
        </Row>
        <hr />
        <Row>
          <Col xs={6} className="fw-bold text-primary">Total:</Col>
          <Col xs={6} className="text-end">
            <Form.Control
              type="text"
              size="sm"
              value={formatearMoneda(totales.total)}
              readOnly
              className="text-end fw-bold border-2 border-primary bg-light text-primary"
            />
          </Col>
        </Row>
      </div>
    </div>
  );
});

ComponenteTotales.displayName = 'ComponenteTotales';

const ModalResultados: React.FC<ModalResultadosProps> = React.memo(({
  show,
  errorProcesamiento,
  datosOrdenCompletos,
  productosEditables,
  totalesCalculados,
  onActualizarProducto,
  onAgregarProducto,
  onVolverAlFormulario,
  onGenerarOrden,
  editId,
  onCancelar
}) => {
  // Estado para la moneda seleccionada
  const [monedaSeleccionada, setMonedaSeleccionada] = useState<string>('MXN');
  // Estado para el porcentaje de IVA simbólico seleccionado
  const [porcentajeIvaSimbolico, setPorcentajeIvaSimbolico] = useState<string>('16');
  // Estado para controlar el loading del botón de generar orden
  const [generandoOrden, setGenerandoOrden] = useState<boolean>(false);

  // Detectar automáticamente el porcentaje de IVA al cargar los datos
  React.useEffect(() => {
    if (totalesCalculados.subTotal > 0 && totalesCalculados.iva > 0) {
      const porcentajeDetectado = ((totalesCalculados.iva / totalesCalculados.subTotal) * 100).toFixed(0);
      // Solo cambiar si es un porcentaje común y el usuario no ha cambiado manualmente
      if (['0', '8', '16'].includes(porcentajeDetectado)) {
        setPorcentajeIvaSimbolico(porcentajeDetectado);
      }
    }
  }, [totalesCalculados]);

  const handleGenerarOrden = async () => {
    if (!onGenerarOrden || productosEditables.length === 0) return;
    
    try {
      setGenerandoOrden(true);
      
      // Preparar los datos de la orden para enviar al backend
      const datosParaEnviar = {
        numeroOrden: datosOrdenCompletos?.numeroOrden || '',
        fecha: datosOrdenCompletos?.fecha || new Date().toISOString(),
        proveedor: datosOrdenCompletos?.proveedor?.id || datosOrdenCompletos?.proveedor?._id,
        razonSocial: datosOrdenCompletos?.razonSocial?.id || datosOrdenCompletos?.razonSocial?._id,
        vendedor: datosOrdenCompletos?.vendedor?.id || datosOrdenCompletos?.vendedor?._id,
        direccionEnvio: datosOrdenCompletos?.direccionEnvio,
        productos: productosEditables,
        totalesCalculados: totalesCalculados,
        datosPdf: datosOrdenCompletos?.datosPdf || datosOrdenCompletos?.pdfInfo,
        moneda: monedaSeleccionada,
        porcentajeIvaSimbolico: porcentajeIvaSimbolico
      };
      
      await onGenerarOrden(datosParaEnviar);
    } catch (error) {
      console.error('Error al generar orden:', error);
    } finally {
      setGenerandoOrden(false);
    }
  };
  const handleCerrarModal = () => {
    if (onCancelar) {
      onCancelar();
    } else {
      onVolverAlFormulario();
    }
  };

  return (
    <Modal show={show} onHide={handleCerrarModal} size="xl" centered>
      <Modal.Header className="bg-success text-white">
        <Modal.Title>
          <i className="fas fa-check-circle me-2"></i>
          Orden Procesada Exitosamente
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 py-3" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        {errorProcesamiento ? (
          <Alert variant="danger">
            <strong>Error al procesar:</strong>
            <br />
            {errorProcesamiento}
          </Alert>
        ) : (
          <>
            <Alert variant="success" className="mb-4">
              <strong>¡Procesamiento completado!</strong>
              <br />
              La orden ha sido procesada exitosamente. Revise y edite los productos según sea necesario.
            </Alert>

            {/* Información básica de la orden */}
            {datosOrdenCompletos && (
              <Row className="mb-4">
                <Col md={6}>
                  <div className="small">
                    <strong>Orden:</strong> {datosOrdenCompletos.numeroOrden}<br />
                    <strong>Proveedor:</strong> {datosOrdenCompletos.proveedor?.empresa}<br />
                    <strong>Razón Social:</strong> {datosOrdenCompletos.razonSocial?.nombre}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="small">
                    <strong>PDF:</strong> {datosOrdenCompletos.pdfInfo?.nombre}<br />
                    <strong>Procesado:</strong> {new Date(datosOrdenCompletos.fechaProcesamiento).toLocaleString()}<br />
                    <strong>Estado:</strong> <Badge bg="success">Procesado</Badge>
                  </div>
                </Col>
              </Row>
            )}

            {/* Selectores de configuración */}
            <div className="mb-4 p-3" style={{ backgroundColor: '#f0f8ff', borderRadius: '8px', border: '1px solid #b3d9ff' }}>
              <Row className="align-items-center mb-3">
                <Col md={12}>
                  <h6 className="text-info mb-3">
                    <i className="fas fa-cogs me-2"></i>
                    Configuración de la Orden
                  </h6>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold mb-1">Tipo de Moneda:</Form.Label>
                    <Form.Select
                      size="sm"
                      value={monedaSeleccionada}
                      onChange={(e) => setMonedaSeleccionada(e.target.value)}
                      className="border-info"
                    >
                      <option value="MXN">
                        {MONEDAS.MXN.simbolo} {MONEDAS.MXN.nombre} ({MONEDAS.MXN.codigo})
                      </option>
                      <option value="USD">
                        {MONEDAS.USD.simbolo} {MONEDAS.USD.nombre} ({MONEDAS.USD.codigo})
                      </option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold mb-1">Porcentaje de IVA (Simbólico):</Form.Label>
                    <Form.Select
                      size="sm"
                      value={porcentajeIvaSimbolico}
                      onChange={(e) => setPorcentajeIvaSimbolico(e.target.value)}
                      className="border-info"
                    >
                      {Object.entries(PORCENTAJES_IVA).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.nombre}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                      <small><i className="fas fa-info-circle me-1"></i>Solo para mostrar en el PDF. El valor real se toma de la cotización.</small>
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Tabla de productos editables */}
            {productosEditables.length > 0 && (
              <div className="mb-4">
                <h5 className="text-primary mb-3">
                  <i className="fas fa-shopping-cart me-2"></i>
                  Productos de la Orden
                </h5>
                
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th style={{ width: '5%' }}>#</th>
                        <th style={{ width: '12%' }}>Código</th>
                        <th style={{ width: '35%' }}>Descripción</th>
                        <th style={{ width: '8%' }}>Cantidad</th>
                        <th style={{ width: '8%' }}>Unidad</th>
                        <th style={{ width: '12%' }}>Precio Unitario</th>
                        <th style={{ width: '20%' }}>Importe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosEditables.map((producto, index) => (
                        <FilaProducto
                          key={`producto-${index}-${producto.clave || 'sin-clave'}`}
                          producto={producto}
                          index={index}
                          onActualizar={onActualizarProducto}
                          moneda={monedaSeleccionada}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Totales */}
            <div className="mb-4">
              <Row>
                <Col md={8}></Col>
                <Col md={4}>
                  <ComponenteTotales 
                    totales={totalesCalculados} 
                    moneda={monedaSeleccionada}
                    porcentajeIvaSimbolico={porcentajeIvaSimbolico}
                  />
                </Col>
              </Row>
            </div>



            {/* Datos completos JSON (colapsible) */}
            <div className="mt-4">
              <details>
                <summary className="fw-bold text-muted" style={{ cursor: 'pointer' }}>
                  <i className="fas fa-code me-2"></i>
                  Ver datos completos (JSON)
                </summary>
                <div className="bg-light p-3 rounded mt-2">
                  <pre style={{ 
                    whiteSpace: 'pre-wrap', 
                    wordWrap: 'break-word',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    fontSize: '0.875rem',
                    lineHeight: '1.4'
                  }}>
                    {datosOrdenCompletos ? JSON.stringify(datosOrdenCompletos, null, 2) : 'Cargando...'}
                  </pre>
                </div>
              </details>
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer className="bg-light border-top">
        <Button variant="outline-secondary" onClick={onVolverAlFormulario}>
          <i className="fas fa-arrow-left me-2"></i>
          Volver al Formulario
        </Button>
        <Button variant="outline-danger" onClick={handleCerrarModal}>
          <i className="fas fa-times me-2"></i>
          Cancelar
        </Button>
        <Button 
          variant="success" 
          disabled={productosEditables.length === 0 || generandoOrden}
          onClick={handleGenerarOrden}
        >
          {generandoOrden ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              {editId ? 'Actualizando...' : 'Generando...'}
            </>
          ) : (
            <>
              <i className="fas fa-file-pdf me-2"></i>
              {editId ? 'Actualizar Orden' : 'Generar Orden'}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
});

ModalResultados.displayName = 'ModalResultados';

export default ModalResultados;
