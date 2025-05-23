import React from "react";
import { Modal, Button, Row, Col, Form } from "react-bootstrap";
import { IInventoryItem } from "../../types";

interface ItemModalProps {
  show: boolean;
  onHide: () => void;
  onSave: () => void;
  item: IInventoryItem;
  setItem: (item: IInventoryItem) => void;
  isEdit?: boolean;
}

const categorias = [
  "Cómputo",
  "Alarma",
  "Control de Acceso",
  "Redes",
  "Electricidad",
  "Videovigilancia",
];

const ItemModal: React.FC<ItemModalProps> = ({ show, onHide, onSave, item, setItem, isEdit }) => {
  const handleSerieChange = (index: number, value: string) => {
    const nuevos = [...item.numerosSerie];
    nuevos[index] = value;
    setItem({ ...item, numerosSerie: nuevos });
  };
  const addSerieField = () => {
    setItem({ ...item, numerosSerie: [...item.numerosSerie, ""] });
  };
  const handleCategoriaChange = (categoria: string) => {
    const yaExiste = item.categorias.includes(categoria);
    setItem({
      ...item,
      categorias: yaExiste
        ? item.categorias.filter((cat) => cat !== categoria)
        : [...item.categorias, categoria],
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Editar Artículo" : "Agregar Artículo al Inventario"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          {[
            { field: "descripcion", label: "Descripción" },
            { field: "marca", label: "Marca" },
            { field: "modelo", label: "Modelo" },
            { field: "proveedor", label: "Proveedor" },
          ].map(({ field, label }) => (
            <Col md={6} className="mb-3" key={field}>
              <Form.Label>{label}</Form.Label>
              <Form.Control
                type="text"
                value={(item as any)[field]}
                onChange={(e) => setItem({ ...item, [field]: e.target.value })}
              />
            </Col>
          ))}

          <Col md={4} className="mb-3">
            <Form.Label>Unidad</Form.Label>
            <Form.Select
              value={item.unidad}
              onChange={(e) => setItem({ ...item, unidad: e.target.value })}
            >
              <option value="PZA">PZA</option>
              <option value="MTS">MTS</option>
            </Form.Select>
          </Col>

          <Col md={4} className="mb-3">
            <Form.Label>Precio Unitario</Form.Label>
            <Form.Control
              type="number"
              value={item.precioUnitario}
              onChange={(e) => setItem({ ...item, precioUnitario: Number(e.target.value) })}
            />
          </Col>

          <Col md={4} className="mb-3">
            <Form.Label>Cantidad</Form.Label>
            <Form.Control
              type="number"
              value={item.cantidad}
              onChange={(e) => setItem({ ...item, cantidad: Number(e.target.value) })}
            />
          </Col>

          <Col md={12} className="mb-3">
            <Form.Label>Categorías</Form.Label>
            <Row>
              {categorias.map((categoria, index) => (
                <Col xs={6} key={index}>
                  <Form.Check
                    type="checkbox"
                    label={categoria}
                    checked={item.categorias.includes(categoria)}
                    onChange={() => handleCategoriaChange(categoria)}
                    className="mb-2"
                  />
                </Col>
              ))}
            </Row>
          </Col>

          <Col md={12}>
            <Form.Label>Números de Serie</Form.Label>
            {item.numerosSerie.map((serie, index) => (
              <Form.Control
                key={index}
                className="mb-2"
                type="text"
                value={serie}
                placeholder={`Número de serie ${index + 1}`}
                onChange={(e) => handleSerieChange(index, e.target.value)}
              />
            ))}
            <Button variant="outline-primary" onClick={addSerieField} size="sm">
              + Agregar número de serie
            </Button>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="success" onClick={onSave}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ItemModal;
