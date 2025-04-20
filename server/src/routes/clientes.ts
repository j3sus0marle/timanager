import express from 'express';
import Cliente from '../models/Cliente';

const router = express.Router();

// Obtener todos los clientes
router.get('/', async (_, res) => {
  const clientes = await Cliente.find();
  res.json(clientes);
});

// Crear un nuevo cliente
router.post('/', async (req, res) => {
  const nuevo = new Cliente(req.body);
  await nuevo.save();
  res.json(nuevo);
});

// Actualizar un cliente existente
router.put('/:id', async (req, res) => {
  const actualizado = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(actualizado);
});

// Eliminar un cliente
router.delete('/:id', async (req, res) => {
  await Cliente.findByIdAndDelete(req.params.id);
  res.json({ mensaje: 'Cliente eliminado' });
});

export default router;
