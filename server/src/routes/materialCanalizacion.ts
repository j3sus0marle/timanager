import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { 
  getMaterialesCanalizacion, 
  getMaterialCanalizacionById, 
  createMaterialCanalizacion, 
  updateMaterialCanalizacion, 
  deleteMaterialCanalizacion,
  searchMaterialesCanalizacion
} from '../controllers/materialCanalizacionController';

const router = Router();

// Helper para manejar errores de funciones async
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Rutas para materiales de canalización
router.get('/', asyncHandler(getMaterialesCanalizacion));
router.get('/search', asyncHandler(searchMaterialesCanalizacion)); // Ruta para búsqueda específica
router.get('/:id', asyncHandler(getMaterialCanalizacionById));
router.post('/', asyncHandler(createMaterialCanalizacion));
router.put('/:id', asyncHandler(updateMaterialCanalizacion));
router.delete('/:id', asyncHandler(deleteMaterialCanalizacion));

export default router;
