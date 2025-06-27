import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { 
  getOrdenesCompra, 
  getOrdenCompraById, 
  createOrdenCompra, 
  updateOrdenCompra, 
  deleteOrdenCompra,
  getOrdenesByProveedor,
  getOrdenesByRazonSocial,
  getOrdenesByDateRange,
  procesarPdf
} from '../controllers/ordenCompraController';

const router = Router();

// Configuración de multer para carga de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = 'uploads/';
    // Crear directorio si no existe
    if (!require('fs').existsSync(uploadsDir)) {
      require('fs').mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Nombre único para evitar colisiones
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `orden-${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      const error = new Error('Solo se permiten archivos PDF') as any;
      cb(error, false);
    }
  }
});

// Helper para manejar errores de funciones async
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Rutas principales para órdenes de compra
router.get('/', asyncHandler(getOrdenesCompra));
router.get('/fecha-rango', asyncHandler(getOrdenesByDateRange)); // Debe ir antes de /:id
router.get('/proveedor/:proveedorId', asyncHandler(getOrdenesByProveedor));
router.get('/razon-social/:razonSocialId', asyncHandler(getOrdenesByRazonSocial));
router.get('/:id', asyncHandler(getOrdenCompraById));
router.post('/', asyncHandler(createOrdenCompra));
router.put('/:id', asyncHandler(updateOrdenCompra));
router.delete('/:id', asyncHandler(deleteOrdenCompra));

// Ruta para procesar PDFs
router.post('/procesar-pdf', upload.single('pdf'), asyncHandler(procesarPdf));

export default router;
