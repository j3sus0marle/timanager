import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
  getDocumentosByColaborador, 
  getAllDocumentos,
  createDocumento, 
  deleteDocumento,
  verDocumento
} from '../controllers/documentoController';

const router = Router();

// Configurar el almacenamiento de documentos
const documentosDir = path.join(__dirname, '../../uploads/documentos');

// Crear directorio si no existe
if (!fs.existsSync(documentosDir)) {
  fs.mkdirSync(documentosDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, documentosDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no válido. Solo se permiten PDFs e imágenes.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  }
});

const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Rutas
router.get('/', asyncHandler(getAllDocumentos));
router.get('/colaborador/:colaboradorId', asyncHandler(getDocumentosByColaborador));
router.get('/ver/:nombre', asyncHandler(verDocumento));
router.post('/', upload.single('documento'), asyncHandler(createDocumento));
router.delete('/:id', asyncHandler(deleteDocumento));

export default router;
