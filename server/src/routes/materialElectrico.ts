import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { 
  getMaterialesElectricos, 
  getMaterialElectricoById, 
  createMaterialElectrico, 
  updateMaterialElectrico, 
  deleteMaterialElectrico,
  searchMaterialesElectricos
} from '../controllers/materialElectricoController';

const router = Router();

// Helper para manejar errores de funciones async
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Rutas para materiales eléctricos
router.get('/', asyncHandler(getMaterialesElectricos));
router.get('/search', asyncHandler(searchMaterialesElectricos)); // Ruta para búsqueda específica
router.get('/:id', asyncHandler(getMaterialElectricoById));
router.post('/', asyncHandler(createMaterialElectrico));
router.put('/:id', asyncHandler(updateMaterialElectrico));
router.delete('/:id', asyncHandler(deleteMaterialElectrico));

export default router;
