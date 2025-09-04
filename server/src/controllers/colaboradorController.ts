import { Request, Response } from 'express';
import Colaborador from '../models/Colaborador';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

export const getColaboradores = async (req: Request, res: Response) => {
  try {
    const colaboradores = await Colaborador.find()
      .populate('razonSocialId', 'nombre')
      .sort({ numeroEmpleado: 1 }); // Ordenar por numeroEmpleado de manera ascendente
    res.json(colaboradores);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener colaboradores' });
  }
};

export const getColaboradorById = async (req: Request, res: Response) => {
  try {
    const colaborador = await Colaborador.findById(req.params.id)
      .populate('razonSocialId', 'nombre');
    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador no encontrado' });
    }
    res.json(colaborador);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el colaborador' });
  }
};

export const createColaborador = async (req: Request, res: Response) => {
  try {
    console.log('Datos recibidos:', {
      body: req.body,
      file: req.file
    });

    const { nss, razonSocialId, fechaAltaIMSS, ...rest } = req.body;
    
    // Validar NSS único y formato
    if (!/^\d{11}$/.test(nss)) {
      return res.status(400).json({ error: 'El NSS debe contener exactamente 11 dígitos' });
    }
    
    const existingNSS = await Colaborador.findOne({ nss });
    if (existingNSS) {
      return res.status(400).json({ error: 'El NSS ya está registrado' });
    }

    // Validar que la razón social existe
    try {
      if (!mongoose.Types.ObjectId.isValid(razonSocialId)) {
        return res.status(400).json({ error: 'ID de razón social inválido' });
      }
      
      const razonSocial = await mongoose.model('RazonSocial').findById(razonSocialId);
      if (!razonSocial) {
        return res.status(400).json({ error: 'La razón social seleccionada no existe' });
      }
    } catch (error: any) {
      console.error('Error validando razón social:', error);
      return res.status(400).json({ error: 'Error al validar la razón social: ' + (error.message || 'Error desconocido') });
    }

    // Preparar los datos del colaborador
    const colaboradorData = {
      nss,
      razonSocialId: new mongoose.Types.ObjectId(razonSocialId),
      fechaAltaIMSS: new Date(fechaAltaIMSS),
      ...rest
    };

    // Eliminar numeroEmpleado si viene en los datos ya que se generará automáticamente
    delete colaboradorData.numeroEmpleado;

    // Si hay archivo, agregar la ruta de la fotografía, si no, usar la imagen por defecto
    if (req.file) {
      colaboradorData.fotografia = `/uploads/fotografias/${req.file.filename}`;
      console.log('Ruta de la fotografía guardada:', colaboradorData.fotografia);
    } else {
      colaboradorData.fotografia = `/test.png`;
      console.log('Usando imagen por defecto:', colaboradorData.fotografia);
    }

    // Crear el colaborador
    try {
      console.log('Datos antes de crear:', colaboradorData);
      
      // Asegurarse de que razonSocialId sea un ObjectId válido
      if (typeof colaboradorData.razonSocialId === 'string') {
        colaboradorData.razonSocialId = new mongoose.Types.ObjectId(colaboradorData.razonSocialId);
      }
      
      const colaborador = new Colaborador(colaboradorData);
      await colaborador.save();
      
      // Buscar el colaborador con la población de razón social
      const populatedColaborador = await Colaborador.findById(colaborador._id)
        .populate('razonSocialId', 'nombre')
        .lean(); // Convertir a objeto plano
      
      console.log('Colaborador creado:', populatedColaborador);
      
      res.status(201).json(populatedColaborador);
    } catch (error: any) {
      console.error('Error guardando colaborador:', error);
      res.status(400).json({ error: 'Error al guardar el colaborador: ' + (error.message || 'Error desconocido') });
    }
  } catch (err: any) {
    console.error('Error general:', err);
    res.status(400).json({ error: 'Error al crear colaborador: ' + (err.message || 'Error desconocido') });
  }
};

export const updateColaborador = async (req: Request, res: Response) => {
  try {
    console.log('Datos de actualización recibidos:', {
      body: req.body,
      file: req.file
    });

    const { nss, ...rest } = req.body;
    
    // Validar NSS único (excepto para el mismo colaborador)
    const existingNSS = await Colaborador.findOne({ 
      nss, 
      _id: { $ne: req.params.id } 
    });
    
    if (existingNSS) {
      return res.status(400).json({ error: 'El NSS ya está registrado' });
    }

    // Preparar los datos de actualización
    const updateData = { 
      nss, 
      ...rest,
      // Asegurarse de que razonSocialId sea un ObjectId si está presente
      ...(rest.razonSocialId && { razonSocialId: new mongoose.Types.ObjectId(rest.razonSocialId) })
    };
    
    // Si se está eliminando la foto y no se proporciona una nueva, usar la imagen por defecto
    if (rest.removePhoto && !req.file) {
      updateData.fotografia = `/test.png`;
    }

    // Si hay un nuevo archivo, actualizar la ruta de la fotografía
    if (req.file) {
      updateData.fotografia = `/uploads/fotografias/${req.file.filename}`;

      // Opcionalmente, eliminar la foto anterior
      const oldColaborador = await Colaborador.findById(req.params.id);
      if (oldColaborador?.fotografia) {
        const oldPhotoPath = path.join(__dirname, '../../', oldColaborador.fotografia);
        try {
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        } catch (error) {
          console.error('Error al eliminar la foto anterior:', error);
        }
      }
    }

    // Asegurarse de que razonSocialId sea un ObjectId válido si está presente
    if (updateData.razonSocialId && typeof updateData.razonSocialId === 'string') {
      updateData.razonSocialId = new mongoose.Types.ObjectId(updateData.razonSocialId);
    }

    console.log('Datos de actualización:', updateData);

    const colaborador = await Colaborador.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('razonSocialId', 'nombre');

    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador no encontrado' });
    }
    
    res.json(colaborador);
  } catch (err) {
    console.error('Error al actualizar colaborador:', err);
    res.status(400).json({ error: 'Error al actualizar colaborador' });
  }
};

export const deleteColaborador = async (req: Request, res: Response) => {
  try {
    // Buscar el colaborador primero para obtener la ruta de la foto
    const colaborador = await Colaborador.findById(req.params.id);
    
    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador no encontrado' });
    }

    // Si existe una fotografía, eliminarla del sistema de archivos
    if (colaborador.fotografia) {
      const photoPath = path.join(__dirname, '../../', colaborador.fotografia);
      try {
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      } catch (error) {
        console.error('Error al eliminar la foto:', error);
      }
    }

    // Eliminar el colaborador de la base de datos
    await Colaborador.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Colaborador eliminado correctamente' });
  } catch (err) {
    res.status(400).json({ error: 'Error al eliminar colaborador' });
  }
};

// Función para validar el formato del NSS (puede ajustarse según necesidades)
export const validateNSS = (nss: string): boolean => {
  return /^\d{11}$/.test(nss);
};

export const getFotografia = async (req: Request, res: Response) => {
  try {
    const nombreArchivo = req.params.nombre;
    console.log('Nombre de archivo de foto solicitado:', nombreArchivo);
    
    // Construir la ruta absoluta al archivo
    const filePath = path.resolve(__dirname, '../../uploads/fotografias', nombreArchivo);
    console.log('Ruta completa de la foto:', filePath);
    
    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      console.error('Foto no encontrada en:', filePath);
      return res.status(404).json({ 
        error: 'Foto no encontrada',
        requestedPath: filePath,
        fileName: nombreArchivo 
      });
    }

    // Verificar que el archivo está dentro del directorio permitido
    const uploadsDir = path.resolve(__dirname, '../../uploads/fotografias');
    if (!filePath.startsWith(uploadsDir)) {
      console.error('Intento de acceso a foto fuera del directorio permitido');
      return res.status(403).json({ error: 'Acceso no permitido' });
    }

    console.log('Enviando foto:', filePath);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error al enviar foto:', err);
        res.status(500).json({ error: 'Error al enviar la foto' });
      } else {
        console.log('Foto enviada correctamente');
      }
    });
  } catch (err) {
    console.error('Error al servir la foto:', err);
    res.status(500).json({ error: 'Error al servir la foto' });
  }
};
