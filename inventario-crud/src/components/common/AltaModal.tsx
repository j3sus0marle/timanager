import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { IInventoryItem } from "../../types";
import { BrowserMultiFormatReader } from '@zxing/browser';

interface AltaModalProps {
  show: boolean;
  onHide: () => void;
  onAlta: (item: IInventoryItem | null, sn: string) => void;
  items: IInventoryItem[];
}

const AltaModal: React.FC<AltaModalProps> = ({ show, onHide, onAlta, items }) => {
  const [scanError, setScanError] = useState<string | null>(null);
  const [foundItem, setFoundItem] = useState<IInventoryItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sn, setSn] = useState<string>("");
  const [quantityToAdd, setQuantityToAdd] = useState<number>(1);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScanError(null);
    setFoundItem(null);
    setSn("");
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleProcessImage = async () => {
    if (!selectedImage) return;
    setScanError(null);
    setFoundItem(null);
    // Leer la imagen como URL
    const imageUrl = URL.createObjectURL(selectedImage);
    try {
      const img = document.createElement('img');
      img.src = imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      const reader = new BrowserMultiFormatReader();
      const result = await reader.decodeFromImageElement(img);
      const code = result.getText();
      setSn(code);
      const item = items.find(
        (it) =>
          it.numerosSerie.includes(code)
      );
      if (item) {
        setFoundItem(item);
        setScanError(`Número de serie detectado: ${code}`);
      } else {
        setFoundItem(null);
        setScanError(`No se encontró ningún artículo con el número de serie: ${code}`);
      }
    } catch (e) {
      setFoundItem(null);
      setScanError('No se pudo leer ningún código de barras o QR en la imagen.');
    }
  };

  const handleAlta = () => {
    if (foundItem) {
      onAlta({ ...foundItem, cantidad: foundItem.cantidad + quantityToAdd }, sn);
    } else {
      onAlta(null, sn);
    }
    handleClose();
  };

  const handleClose = () => {
    setScanError(null);
    setFoundItem(null);
    setSelectedImage(null);
    setImagePreview(null);
    setSn("");
    setQuantityToAdd(1);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Alta de artículo por escaneo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3 d-flex flex-column gap-2">
          <Form.Group controlId="formFileAlta" className="mb-3">
            <Form.Label>Abre la cámara o galería para tomar/subir una foto del código</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              disabled={!!foundItem || !!sn}
            />
          </Form.Group>
          {imagePreview && (
            <div className="text-center mb-2">
              <img src={imagePreview} alt="preview" style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }} />
              {!foundItem && !sn && (
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
              <b>Artículo ya registrado con este número de serie:</b>
              <div>Descripción: {foundItem.descripcion}</div>
              <div>Marca: {foundItem.marca}</div>
              <div>Modelo: {foundItem.modelo}</div>
              <div>Proveedor: {foundItem.proveedor}</div>
              <div>Unidad: {foundItem.unidad}</div>
              <div>Precio Unitario: {foundItem.precioUnitario}</div>
              <div>Cantidad disponible: {foundItem.cantidad}</div>
            </Alert>
            <Form.Group className="mb-2" controlId="formQuantityAlta">
              <Form.Label>Cantidad a agregar</Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={quantityToAdd}
                onChange={e => setQuantityToAdd(Math.max(1, Number(e.target.value)))}
                autoFocus
              />
            </Form.Group>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleAlta}
          disabled={Boolean((!sn) || (foundItem && (!quantityToAdd || quantityToAdd < 1)))}
        >
          {foundItem ? "Agregar cantidad" : "Registrar nuevo artículo"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AltaModal;
