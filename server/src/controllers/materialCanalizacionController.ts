import { Request, Response } from 'express';
import MaterialCanalizacion from '../models/MaterialCanalizacion';

export const getMaterialesCanalizacion = async (req: Request, res: Response) => {
  try {
    const materiales = await MaterialCanalizacion.find().sort({ fechaActualizacion: -1 });
    res.json(materiales);
  } catch (err) {
    console.error('Error al obtener materiales de canalización:', err);
    res.status(500).json({ error: 'Error al obtener materiales de canalización' });
  }
};

export const getMaterialCanalizacionById = async (req: Request, res: Response) => {
  try {
    const material = await MaterialCanalizacion.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'Material de canalización no encontrado' });
    }
    res.json(material);
  } catch (err) {
    console.error('Error al obtener material de canalización:', err);
    res.status(500).json({ error: 'Error al obtener material de canalización' });
  }
};

export const createMaterialCanalizacion = async (req: Request, res: Response) => {
  try {
    // Asegurar que fechaActualizacion esté establecida
    const materialData = {
      ...req.body,
      fechaActualizacion: new Date()
    };
    
    const material = new MaterialCanalizacion(materialData);
    await material.save();
    res.status(201).json(material);
  } catch (err) {
    console.error('Error al crear material de canalización:', err);
    res.status(400).json({ error: 'Error al crear material de canalización' });
  }
};

export const updateMaterialCanalizacion = async (req: Request, res: Response) => {
  try {
    // Asegurar que fechaActualizacion se actualice
    const updateData = {
      ...req.body,
      fechaActualizacion: new Date()
    };
    
    const material = await MaterialCanalizacion.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!material) {
      return res.status(404).json({ error: 'Material de canalización no encontrado' });
    }
    res.json(material);
  } catch (err) {
    console.error('Error al actualizar material de canalización:', err);
    res.status(400).json({ error: 'Error al actualizar material de canalización' });
  }
};

export const deleteMaterialCanalizacion = async (req: Request, res: Response) => {
  try {
    const material = await MaterialCanalizacion.findByIdAndDelete(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'Material de canalización no encontrado' });
    }
    res.json({ message: 'Material de canalización eliminado exitosamente' });
  } catch (err) {
    console.error('Error al eliminar material de canalización:', err);
    res.status(400).json({ error: 'Error al eliminar material de canalización' });
  }
};

// Función adicional para buscar materiales por criterios específicos
export const searchMaterialesCanalizacion = async (req: Request, res: Response) => {
  try {
    const { tipo, material, proveedor, unidad } = req.query;
    const filter: any = {};
    
    if (tipo) filter.tipo = new RegExp(tipo as string, 'i');
    if (material) filter.material = new RegExp(material as string, 'i');
    if (proveedor) filter.proveedor = new RegExp(proveedor as string, 'i');
    if (unidad) filter.unidad = unidad;
    
    const materiales = await MaterialCanalizacion.find(filter).sort({ fechaActualizacion: -1 });
    res.json(materiales);
  } catch (err) {
    console.error('Error al buscar materiales de canalización:', err);
    res.status(500).json({ error: 'Error al buscar materiales de canalización' });
  }
};
