import { Request, Response } from 'express';
import MaterialElectrico from '../models/MaterialElectrico';

export const getMaterialesElectricos = async (req: Request, res: Response) => {
  try {
    const materiales = await MaterialElectrico.find().sort({ fechaActualizacion: -1 });
    res.json(materiales);
  } catch (err) {
    console.error('Error al obtener materiales eléctricos:', err);
    res.status(500).json({ error: 'Error al obtener materiales eléctricos' });
  }
};

export const getMaterialElectricoById = async (req: Request, res: Response) => {
  try {
    const material = await MaterialElectrico.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'Material eléctrico no encontrado' });
    }
    res.json(material);
  } catch (err) {
    console.error('Error al obtener material eléctrico:', err);
    res.status(500).json({ error: 'Error al obtener material eléctrico' });
  }
};

export const createMaterialElectrico = async (req: Request, res: Response) => {
  try {
    // Asegurar que fechaActualizacion esté establecida
    const materialData = {
      ...req.body,
      fechaActualizacion: new Date()
    };
    
    const material = new MaterialElectrico(materialData);
    await material.save();
    res.status(201).json(material);
  } catch (err) {
    console.error('Error al crear material eléctrico:', err);
    res.status(400).json({ error: 'Error al crear material eléctrico' });
  }
};

export const updateMaterialElectrico = async (req: Request, res: Response) => {
  try {
    // Asegurar que fechaActualizacion se actualice
    const updateData = {
      ...req.body,
      fechaActualizacion: new Date()
    };
    
    const material = await MaterialElectrico.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!material) {
      return res.status(404).json({ error: 'Material eléctrico no encontrado' });
    }
    res.json(material);
  } catch (err) {
    console.error('Error al actualizar material eléctrico:', err);
    res.status(400).json({ error: 'Error al actualizar material eléctrico' });
  }
};

export const deleteMaterialElectrico = async (req: Request, res: Response) => {
  try {
    const material = await MaterialElectrico.findByIdAndDelete(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'Material eléctrico no encontrado' });
    }
    res.json({ message: 'Material eléctrico eliminado exitosamente' });
  } catch (err) {
    console.error('Error al eliminar material eléctrico:', err);
    res.status(400).json({ error: 'Error al eliminar material eléctrico' });
  }
};

// Función adicional para buscar materiales por criterios específicos
export const searchMaterialesElectricos = async (req: Request, res: Response) => {
  try {
    const { tipo, material, proveedor, unidad } = req.query;
    const filter: any = {};
    
    if (tipo) filter.tipo = new RegExp(tipo as string, 'i');
    if (material) filter.material = new RegExp(material as string, 'i');
    if (proveedor) filter.proveedor = new RegExp(proveedor as string, 'i');
    if (unidad) filter.unidad = unidad;
    
    const materiales = await MaterialElectrico.find(filter).sort({ fechaActualizacion: -1 });
    res.json(materiales);
  } catch (err) {
    console.error('Error al buscar materiales eléctricos:', err);
    res.status(500).json({ error: 'Error al buscar materiales eléctricos' });
  }
};
