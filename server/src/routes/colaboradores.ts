import { Router } from 'express';
import multer from 'multer';
import { getColaboradores, getColaboradorById, createColaborador, updateColaborador, deleteColaborador } from '../controllers/colaboradorController';
import upload from '../utils/uploadConfig';

const router = Router();

// Helper para manejar errores de funciones async
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Helper para manejar errores de multer
const uploadMiddleware = (req: any, res: any, next: any) => {
  upload.single('fotografia')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      // Error de multer (tamaño, tipo, etc.)
      return res.status(400).json({
        error: err.code === 'LIMIT_FILE_SIZE' 
          ? 'El archivo es demasiado grande. Máximo 5MB.'
          : `Error al subir el archivo: ${err.message}`
      });
    } else if (err) {
      // Otro tipo de error
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

router.get('/', asyncHandler(getColaboradores));
router.get('/:id', asyncHandler(getColaboradorById));
router.post('/', uploadMiddleware, asyncHandler(createColaborador));
router.put('/:id', uploadMiddleware, asyncHandler(updateColaborador));
router.delete('/:id', asyncHandler(deleteColaborador));

export default router;
