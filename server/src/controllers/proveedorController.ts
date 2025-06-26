import { Request, Response } from 'express';
import Proveedor from '../models/Proveedor';

export const getProveedores = async (req: Request, res: Response) => {
  try {
    const proveedores = await Proveedor.find();
    res.json(proveedores);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
};

export const getProveedorById = async (req: Request, res: Response) => {
  try {
    const proveedor = await Proveedor.findById(req.params.id);
    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    res.json(proveedor);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener proveedor' });
  }
};

export const createProveedor = async (req: Request, res: Response) => {
  try {
    const proveedor = new Proveedor(req.body);
    await proveedor.save();
    res.status(201).json(proveedor);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear proveedor' });
  }
};

export const updateProveedor = async (req: Request, res: Response) => {
  try {
    const proveedor = await Proveedor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    res.json(proveedor);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar proveedor' });
  }
};

export const deleteProveedor = async (req: Request, res: Response) => {
  try {
    const proveedor = await Proveedor.findByIdAndDelete(req.params.id);
    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    res.json({ message: 'Proveedor eliminado exitosamente' });
  } catch (err) {
    res.status(400).json({ error: 'Error al eliminar proveedor' });
  }
};
