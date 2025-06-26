import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { 
  getProveedores, 
  getProveedorById, 
  createProveedor, 
  updateProveedor, 
  deleteProveedor 
} from '../controllers/proveedorController';

const router = Router();

// Helper para manejar errores de funciones async
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Rutas para proveedores
router.get('/', asyncHandler(getProveedores));
router.get('/:id', asyncHandler(getProveedorById));
router.post('/', asyncHandler(createProveedor));
router.put('/:id', asyncHandler(updateProveedor));
router.delete('/:id', asyncHandler(deleteProveedor));

export default router;
