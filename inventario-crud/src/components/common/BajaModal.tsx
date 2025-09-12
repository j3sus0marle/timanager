import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { IInventoryItem } from "../../types";
import { BrowserMultiFormatReader } from '@zxing/browser';

interface BajaModalProps {
  show: boolean;
  onHide: () => void;
  onBaja: (item: IInventoryItem, cantidad: number, comentario: string) => void;
  items: IInventoryItem[];
}

const BajaModal: React.FC<BajaModalProps> = ({ show, onHide, onBaja, items }) => {
  const [scanError, setScanError] = useState<string | null>(null);
  const [foundItem, setFoundItem] = useState<IInventoryItem | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [manualSearch, setManualSearch] = useState("");
  const [comentario, setComentario] = useState("");

  // Maneja la selección/captura de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScanError(null);
    setFoundItem(null);
    setCantidad(1);
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      // Aquí podrías procesar el archivo con una librería de QR/barcode si lo deseas
    }
  };

  // Procesa la imagen usando ZXing para decodificar el código de barras/QR
  const handleProcessImage = async () => {
    if (!selectedImage) return;
    setScanError(null);
    setFoundItem(null);
    setCantidad(1);
    // Leer la imagen como URL
    const imageUrl = URL.createObjectURL(selectedImage);
    try {
      const img = document.createElement('img');
      img.src = imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      // Usa ZXing sin hints personalizados
      const reader = new BrowserMultiFormatReader();
      const result = await reader.decodeFromImageElement(img);
      const code = result.getText();
      // Busca el artículo por el código leído
      const item = items.find(
        (it) =>
          it.modelo === code ||
          it.numerosSerie.includes(code) ||
          it.descripcion === code
      );
      if (item) {
        setFoundItem(item);
        setScanError(`Código detectado: ${code}`);
      } else {
        setFoundItem(null);
        setScanError(`No se encontró ningún artículo con el código: ${code}`);
      }
    } catch (e) {
      setFoundItem(null);
      setScanError('No se pudo leer ningún código de barras o QR en la imagen.');
    }
  };

  // Búsqueda manual
  const handleManualSearch = () => {
    setScanError(null);
    setFoundItem(null);
    setCantidad(1);
    const value = manualSearch.trim().toLowerCase();
    if (!value) return;
    const item = items.find(
      (it) =>
        it.modelo.toLowerCase() === value ||
        it.descripcion.toLowerCase() === value ||
        it.numerosSerie.some(sn => sn.toLowerCase() === value)
    );
    if (item) {
      setFoundItem(item);
      setScanError(`Artículo encontrado: ${item.descripcion}`);
    } else {
      setFoundItem(null);
      setScanError(`No se encontró ningún artículo con ese dato.`);
    }
  };

  // Lógica para realizar la baja
  const handleBaja = () => {
    if (foundItem && cantidad > 0) {
      onBaja(foundItem, cantidad, comentario);
      handleClose();
    }
  };

  // Limpia recursos al cerrar
  const handleClose = () => {
    setScanError(null);
    setFoundItem(null);
    setCantidad(1);
    setSelectedImage(null);
    setImagePreview(null);
    setManualSearch("");
    setComentario("");
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Baja de artículo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3 d-flex flex-column gap-2">
          <Form.Group controlId="manualSearch" className="mb-2">
            <Form.Label>Buscar por número de serie, modelo o descripción</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                value={manualSearch}
                onChange={e => setManualSearch(e.target.value)}
                placeholder="Ej: modelo, descripción o número de serie"
                disabled={!!foundItem}
              />
              <Button variant="outline-primary" onClick={handleManualSearch} disabled={!!foundItem}>Buscar</Button>
            </div>
          </Form.Group>
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>O escanea un código (foto)</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              disabled={!!foundItem}
            />
          </Form.Group>
          {imagePreview && (
            <div className="text-center mb-2">
              <img src={imagePreview} alt="preview" style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }} />
              {!foundItem && (
                <Button className="mt-2" variant="primary" onClick={handleProcessImage}>
                  Procesar imagen
                </Button>
              )}
            </div>
          )}
        </div>
        {scanError && <Alert variant={foundItem ? "success" : "danger"}>{scanError}</Alert>}
        {foundItem && (
          <div className="my-3">
            <Alert variant="success">
              <b>Artículo encontrado:</b>
              <div>Descripción: {foundItem.descripcion}</div>
              <div>Marca: {foundItem.marca}</div>
              <div>Modelo: {foundItem.modelo}</div>
              <div>Proveedor: {foundItem.proveedor}</div>
              <div>Unidad: {foundItem.unidad}</div>
              <div>Precio Unitario: {foundItem.precioUnitario}</div>
              <div>Cantidad disponible: {foundItem.cantidad}</div>
            </Alert>
            <Form.Group controlId="cantidadBaja">
              <Form.Label>Cantidad a retirar</Form.Label>
              <Form.Control
                type="number"
                min={1}
                max={foundItem.cantidad}
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
              />
            </Form.Group>
            <Form.Group controlId="comentarioBaja" className="mt-2">
              <Form.Label>Comentario (motivo de la baja) *</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={comentario}
                onChange={e => setComentario(e.target.value)}
                placeholder="Ingrese el motivo de la baja (requerido)"
                required
                isInvalid={foundItem && !comentario.trim()}
              />
              <Form.Control.Feedback type="invalid">
                El motivo de la baja es requerido
              </Form.Control.Feedback>
            </Form.Group>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        {/* Debug info */}
        <div className="text-muted small mb-2">
          Estado del formulario:
          <br/>
          - Item encontrado: {foundItem ? 'Sí' : 'No'}
          <br/>
          - Cantidad válida: {cantidad >= 1 && cantidad <= (foundItem?.cantidad || 1) ? 'Sí' : 'No'} ({cantidad})
          <br/>
          - Comentario válido: {comentario.trim() ? 'Sí' : 'No'}
        </div>
        <Button
          variant="primary"
          onClick={handleBaja}
          disabled={!foundItem || 
                   cantidad < 1 || 
                   cantidad > (foundItem?.cantidad || 1) ||
                   !comentario.trim()}
        >
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BajaModal;
