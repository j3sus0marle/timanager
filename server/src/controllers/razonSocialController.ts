import { Request, Response } from 'express';
import RazonSocial from '../models/RazonSocial';

export const getRazonesSociales = async (req: Request, res: Response) => {
  try {
    const razonesSociales = await RazonSocial.find();
    res.json(razonesSociales);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener razones sociales' });
  }
};

export const getRazonSocialById = async (req: Request, res: Response) => {
  try {
    const razonSocial = await RazonSocial.findById(req.params.id);
    if (!razonSocial) {
      return res.status(404).json({ error: 'Razón social no encontrada' });
    }
    res.json(razonSocial);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener razón social' });
  }
};

export const getRazonSocialByRfc = async (req: Request, res: Response) => {
  try {
    const razonSocial = await RazonSocial.findOne({ rfc: req.params.rfc });
    if (!razonSocial) {
      return res.status(404).json({ error: 'Razón social no encontrada' });
    }
    res.json(razonSocial);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener razón social' });
  }
};

export const createRazonSocial = async (req: Request, res: Response) => {
  try {
    const razonSocial = new RazonSocial(req.body);
    await razonSocial.save();
    res.status(201).json(razonSocial);
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(400).json({ error: 'Ya existe una razón social con este RFC' });
    } else {
      res.status(400).json({ error: 'Error al crear razón social' });
    }
  }
};

export const updateRazonSocial = async (req: Request, res: Response) => {
  try {
    const razonSocial = await RazonSocial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!razonSocial) {
      return res.status(404).json({ error: 'Razón social no encontrada' });
    }
    res.json(razonSocial);
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(400).json({ error: 'Ya existe una razón social con este RFC' });
    } else {
      res.status(400).json({ error: 'Error al actualizar razón social' });
    }
  }
};

export const deleteRazonSocial = async (req: Request, res: Response) => {
  try {
    const razonSocial = await RazonSocial.findByIdAndDelete(req.params.id);
    if (!razonSocial) {
      return res.status(404).json({ error: 'Razón social no encontrada' });
    }
    res.json({ message: 'Razón social eliminada exitosamente' });
  } catch (err) {
    res.status(400).json({ error: 'Error al eliminar razón social' });
  }
};
