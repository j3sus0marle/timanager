import express from 'express';
import Vendedor from '../models/Vendedor';

const router = express.Router();

// Obtener todos
router.get('/', async (_, res) => {
  const vendedores = await Vendedor.find();
  res.json(vendedores);
});

// Crear uno nuevo
router.post('/', async (req, res) => {
  const nuevo = new Vendedor(req.body);
  await nuevo.save();
  res.json(nuevo);
});

// Actualizar uno
router.put('/:id', async (req, res) => {
  const actualizado = await Vendedor.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(actualizado);
});

// Eliminar uno
router.delete('/:id', async (req, res) => {
  await Vendedor.findByIdAndDelete(req.params.id);
  res.json({ mensaje: 'Vendedor eliminado' });
});

export default router;
