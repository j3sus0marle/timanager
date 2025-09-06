import { Request, Response } from 'express';
import Herramienta, { IHerramienta } from '../models/Herramienta';

// Obtener todas las herramientas
export const getHerramientas = async (req: Request, res: Response) => {
  try {
    const herramientas = await Herramienta.find({ activo: true });
    res.json(herramientas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener herramientas', error });
  }
};

// Obtener herramientas por colaborador
export const getHerramientasByColaborador = async (req: Request, res: Response) => {
  try {
    const { colaboradorId } = req.params;
    const herramientas = await Herramienta.find({ 
      colaboradorId,
      activo: true 
    });
    res.json(herramientas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener herramientas del colaborador', error });
  }
};

// Crear una nueva herramienta
export const createHerramienta = async (req: Request, res: Response) => {
  try {
    const { nombre, marca, modelo, valor, serialNumber, colaboradorId } = req.body;

    // Verificar si ya existe una herramienta con el mismo número de serie
    const existingHerramienta = await Herramienta.findOne({ serialNumber });
    if (existingHerramienta) {
      return res.status(400).json({ message: 'Ya existe una herramienta con este número de serie' });
    }

    const herramienta = new Herramienta({
      nombre,
      marca,
      modelo,
      valor,
      serialNumber,
      colaboradorId
    });

    await herramienta.save();
    res.status(201).json(herramienta);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear herramienta', error });
  }
};

// Actualizar una herramienta
export const updateHerramienta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const update = req.body;

    // Si se está actualizando el número de serie, verificar que no exista duplicado
    if (update.serialNumber) {
      const existingHerramienta = await Herramienta.findOne({ 
        serialNumber: update.serialNumber,
        _id: { $ne: id }
      });
      if (existingHerramienta) {
        return res.status(400).json({ message: 'Ya existe una herramienta con este número de serie' });
      }
    }

    const herramienta = await Herramienta.findByIdAndUpdate(
      id,
      update,
      { new: true }
    );

    if (!herramienta) {
      return res.status(404).json({ message: 'Herramienta no encontrada' });
    }

    res.json(herramienta);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar herramienta', error });
  }
};

// Eliminar una herramienta (baja lógica)
export const deleteHerramienta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const herramienta = await Herramienta.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    );

    if (!herramienta) {
      return res.status(404).json({ message: 'Herramienta no encontrada' });
    }

    res.json({ message: 'Herramienta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar herramienta', error });
  }
};
