import { Request, Response } from 'express';
import Cliente from '../models/Cliente';

export const getClientes = async (req: Request, res: Response) => {
  try {
    const clientes = await Cliente.find();
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
};

export const createCliente = async (req: Request, res: Response) => {
  try {
    const cliente = new Cliente(req.body);
    await cliente.save();
    res.status(201).json(cliente);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear cliente' });
  }
};

export const updateCliente = async (req: Request, res: Response) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar cliente' });
  }
};

export const deleteCliente = async (req: Request, res: Response) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ message: 'Cliente eliminado' });
  } catch (err) {
    res.status(400).json({ error: 'Error al eliminar cliente' });
  }
};
