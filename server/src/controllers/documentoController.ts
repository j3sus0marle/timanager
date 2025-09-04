import { Request, Response } from 'express';
import Documento from '../models/Documento';
import Colaborador from '../models/Colaborador';
import path from 'path';
import fs from 'fs';

export const getDocumentosByColaborador = async (req: Request, res: Response) => {
  try {
    const { colaboradorId } = req.params;
    const documentos = await Documento.find({ colaboradorId })
      .sort({ fechaSubida: -1 });
    res.json(documentos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener documentos' });
  }
};

export const getAllDocumentos = async (req: Request, res: Response) => {
  try {
    const documentos = await Documento.find()
      .populate('colaboradorId', 'numeroEmpleado nombre fotografia')
      .sort({ fechaSubida: -1 });
    res.json(documentos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener documentos' });
  }
};

export const createDocumento = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    console.log('Archivo recibido:', req.file);
    const { colaboradorId, nombre, fechaVencimiento } = req.body;

    // Verificar que el colaborador existe
    const colaborador = await Colaborador.findById(colaboradorId);
    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador no encontrado' });
    }

    const tipo = req.file.mimetype.startsWith('application/pdf') ? 'pdf' : 'image';
    
    // Guardar solo el nombre del archivo, no la ruta completa
    const documento = new Documento({
      nombre,
      url: req.file.filename, // Guardamos solo el nombre del archivo
      colaboradorId,
      fechaVencimiento: fechaVencimiento || null,
      tipo
    });

    console.log('Documento a guardar:', documento);
    await documento.save();
    console.log('Documento guardado:', documento);
    
    res.status(201).json(documento);
  } catch (err) {
    console.error('Error al crear documento:', err);
    res.status(400).json({ error: 'Error al crear documento' });
  }
};

export const verDocumento = async (req: Request, res: Response) => {
  try {
    const nombreArchivo = req.params.nombre;
    console.log('Nombre de archivo solicitado:', nombreArchivo);
    
    // Construir la ruta absoluta al archivo
    const filePath = path.resolve(__dirname, '../../uploads/documentos', nombreArchivo);
    console.log('Ruta completa del archivo:', filePath);
    
    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      console.error('Archivo no encontrado en:', filePath);
      return res.status(404).json({ 
        error: 'Archivo no encontrado',
        requestedPath: filePath,
        fileName: nombreArchivo 
      });
    }

    // Verificar que el archivo está dentro del directorio permitido
    const uploadsDir = path.resolve(__dirname, '../../uploads/documentos');
    if (!filePath.startsWith(uploadsDir)) {
      console.error('Intento de acceso a archivo fuera del directorio permitido');
      return res.status(403).json({ error: 'Acceso no permitido' });
    }

    console.log('Enviando archivo:', filePath);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error al enviar archivo:', err);
        res.status(500).json({ error: 'Error al enviar el archivo' });
      } else {
        console.log('Archivo enviado correctamente');
      }
    });
  } catch (err) {
    console.error('Error al servir el archivo:', err);
    res.status(500).json({ error: 'Error al servir el archivo' });
  }
};

export const deleteDocumento = async (req: Request, res: Response) => {
  try {
    const documento = await Documento.findById(req.params.id);
    if (!documento) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    // Eliminar el archivo físico
    const filePath = path.join(__dirname, '../../', documento.url);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
    }

    // Eliminar el registro de la base de datos
    await Documento.findByIdAndDelete(req.params.id);
    res.json({ message: 'Documento eliminado correctamente' });
  } catch (err) {
    res.status(400).json({ error: 'Error al eliminar documento' });
  }
};
