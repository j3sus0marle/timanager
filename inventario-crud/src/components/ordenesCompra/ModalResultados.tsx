import React, { useMemo } from "react";
import { Modal, Form, Button, Row, Col, Alert, Badge } from "react-bootstrap";

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
}

// Componente optimizado para fila de producto individual
const FilaProducto = React.memo(({ 
  producto, 
  index, 
  onActualizar 
}: { 
  producto: any, 
  index: number, 
  onActualizar: (index: number, campo: string, valor: any) => void 
}) => {
  const importe = useMemo(() => {
    return (Number(producto.cantidad) || 0) * (Number(producto.precioUnitario) || 0);
  }, [producto.cantidad, producto.precioUnitario]);
  
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
          ${importe.toLocaleString('es-MX', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}
        </div>
      </td>
    </tr>
  );
});

FilaProducto.displayName = 'FilaProducto';

// Componente optimizado para los totales
const ComponenteTotales = React.memo(({ totales }: { totales: any }) => {
  const porcentajeIva = useMemo(() => {
    if (totales.subTotal > 0 && totales.iva > 0) {
      return ((totales.iva / totales.subTotal) * 100).toFixed(1);
    }
    return '16.0';
  }, [totales.subTotal, totales.iva]);

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
              value={`$${totales.subTotal.toLocaleString('es-MX', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}`}
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
              value={`$${totales.iva.toLocaleString('es-MX', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}`}
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
              value={`$${totales.total.toLocaleString('es-MX', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}`}
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
  onVolverAlFormulario
}) => {
  return (
    <Modal show={show} onHide={() => {}} size="xl" centered>
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
                  <ComponenteTotales totales={totalesCalculados} />
                </Col>
              </Row>
            </div>

            {/* Botón para agregar más productos */}
            {productosEditables.length > 0 && (
              <div className="mb-3">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={onAgregarProducto}
                >
                  <i className="fas fa-plus me-1"></i>
                  Agregar Producto
                </Button>
              </div>
            )}

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
        <Button variant="success" disabled={productosEditables.length === 0}>
          <i className="fas fa-save me-2"></i>
          Guardar Orden
        </Button>
      </Modal.Footer>
    </Modal>
  );
});

ModalResultados.displayName = 'ModalResultados';

export default ModalResultados;
