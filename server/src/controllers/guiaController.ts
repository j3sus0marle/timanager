import { Request, Response } from 'express';
import Guia from '../models/Guia';

export const getGuias = async (req: Request, res: Response) => {
  try {
    const guias = await Guia.find();
    res.json(guias);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener guías' });
  }
};

export const createGuia = async (req: Request, res: Response) => {
  try {
    const guia = new Guia(req.body);
    await guia.save();
    res.status(201).json(guia);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear guía' });
  }
};

export const updateGuia = async (req: Request, res: Response) => {
  try {
    const guia = await Guia.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!guia) return res.status(404).json({ error: 'Guía no encontrada' });
    res.json(guia);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar guía' });
  }
};

export const deleteGuia = async (req: Request, res: Response) => {
  try {
    const guia = await Guia.findByIdAndDelete(req.params.id);
    if (!guia) return res.status(404).json({ error: 'Guía no encontrada' });
    res.json({ message: 'Guía eliminada' });
  } catch (err) {
    res.status(400).json({ error: 'Error al eliminar guía' });
  }
};
