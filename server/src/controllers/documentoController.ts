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

    const { colaboradorId, nombre, fechaVencimiento } = req.body;

    // Verificar que el colaborador existe
    const colaborador = await Colaborador.findById(colaboradorId);
    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador no encontrado' });
    }

    const tipo = req.file.mimetype.startsWith('application/pdf') ? 'pdf' : 'image';
    
    const documento = new Documento({
      nombre,
      url: `/uploads/documentos/${req.file.filename}`,
      colaboradorId,
      fechaVencimiento: fechaVencimiento || null,
      tipo
    });

    await documento.save();
    res.status(201).json(documento);
  } catch (err) {
    console.error('Error al crear documento:', err);
    res.status(400).json({ error: 'Error al crear documento' });
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
