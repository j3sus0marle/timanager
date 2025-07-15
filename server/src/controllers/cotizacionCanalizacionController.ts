import { Request, Response } from 'express';
import CotizacionCanalizacion from '../models/CotizacionCanalizacion';

export const getCotizacionesCanalizacion = async (req: Request, res: Response) => {
  try {
    const cotizaciones = await CotizacionCanalizacion.find().sort({ fechaActualizacion: -1 });
    res.json(cotizaciones);
  } catch (err) {
    console.error('Error al obtener cotizaciones de canalización:', err);
    res.status(500).json({ error: 'Error al obtener cotizaciones de canalización' });
  }
};

export const getCotizacionCanalizacionById = async (req: Request, res: Response) => {
  try {
    const cotizacion = await CotizacionCanalizacion.findById(req.params.id);
    if (!cotizacion) {
      return res.status(404).json({ error: 'Cotización de canalización no encontrada' });
    }
    res.json(cotizacion);
  } catch (err) {
    console.error('Error al obtener cotización de canalización:', err);
    res.status(500).json({ error: 'Error al obtener cotización de canalización' });
  }
};

export const createCotizacionCanalizacion = async (req: Request, res: Response) => {
  try {
    const cotizacionData = {
      ...req.body,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    };
    
    const cotizacion = new CotizacionCanalizacion(cotizacionData);
    
    // Calcular totales automáticamente si hay items
    if (cotizacion.items && cotizacion.items.length > 0) {
      cotizacion.calcularTotales();
    }
    
    await cotizacion.save();
    res.status(201).json(cotizacion);
  } catch (err: any) {
    console.error('Error al crear cotización de canalización:', err);
    if (err.code === 11000) {
      res.status(400).json({ error: 'El número de folio ya existe' });
    } else {
      res.status(400).json({ error: 'Error al crear cotización de canalización' });
    }
  }
};

export const updateCotizacionCanalizacion = async (req: Request, res: Response) => {
  try {
    const updateData = {
      ...req.body,
      fechaActualizacion: new Date()
    };
    
    const cotizacion = await CotizacionCanalizacion.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!cotizacion) {
      return res.status(404).json({ error: 'Cotización de canalización no encontrada' });
    }
    
    // Recalcular totales si hay items
    if (cotizacion.items && cotizacion.items.length > 0) {
      cotizacion.calcularTotales();
      await cotizacion.save();
    }
    
    res.json(cotizacion);
  } catch (err: any) {
    console.error('Error al actualizar cotización de canalización:', err);
    if (err.code === 11000) {
      res.status(400).json({ error: 'El número de folio ya existe' });
    } else {
      res.status(400).json({ error: 'Error al actualizar cotización de canalización' });
    }
  }
};

export const deleteCotizacionCanalizacion = async (req: Request, res: Response) => {
  try {
    const cotizacion = await CotizacionCanalizacion.findByIdAndDelete(req.params.id);
    if (!cotizacion) {
      return res.status(404).json({ error: 'Cotización de canalización no encontrada' });
    }
    res.json({ message: 'Cotización de canalización eliminada exitosamente' });
  } catch (err) {
    console.error('Error al eliminar cotización de canalización:', err);
    res.status(400).json({ error: 'Error al eliminar cotización de canalización' });
  }
};

// Buscar cotizaciones por criterios específicos
export const searchCotizacionesCanalizacion = async (req: Request, res: Response) => {
  try {
    const { cliente, proyecto, estado, fechaDesde, fechaHasta } = req.query;
    const filter: any = {};
    
    if (cliente) filter.cliente = new RegExp(cliente as string, 'i');
    if (proyecto) filter.proyecto = new RegExp(proyecto as string, 'i');
    if (estado) filter.estado = estado;
    
    if (fechaDesde || fechaHasta) {
      filter.fecha = {};
      if (fechaDesde) filter.fecha.$gte = new Date(fechaDesde as string);
      if (fechaHasta) filter.fecha.$lte = new Date(fechaHasta as string);
    }
    
    const cotizaciones = await CotizacionCanalizacion.find(filter).sort({ fechaActualizacion: -1 });
    res.json(cotizaciones);
  } catch (err) {
    console.error('Error al buscar cotizaciones de canalización:', err);
    res.status(500).json({ error: 'Error al buscar cotizaciones de canalización' });
  }
};

// Cambiar estado de la cotización
export const cambiarEstadoCotizacion = async (req: Request, res: Response) => {
  try {
    const { estado } = req.body;
    const estadosValidos = ['Borrador', 'Enviada', 'Aceptada', 'Rechazada', 'Vencida'];
    
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }
    
    const cotizacion = await CotizacionCanalizacion.findByIdAndUpdate(
      req.params.id,
      { 
        estado, 
        fechaActualizacion: new Date() 
      },
      { new: true, runValidators: true }
    );
    
    if (!cotizacion) {
      return res.status(404).json({ error: 'Cotización de canalización no encontrada' });
    }
    
    res.json(cotizacion);
  } catch (err) {
    console.error('Error al cambiar estado de cotización:', err);
    res.status(400).json({ error: 'Error al cambiar estado de cotización' });
  }
};
