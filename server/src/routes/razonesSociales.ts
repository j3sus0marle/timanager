import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { 
  getRazonesSociales, 
  getRazonSocialById, 
  getRazonSocialByRfc,
  createRazonSocial, 
  updateRazonSocial, 
  deleteRazonSocial 
} from '../controllers/razonSocialController';

const router = Router();

// Helper para manejar errores de funciones async
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Rutas para razones sociales
router.get('/', asyncHandler(getRazonesSociales));
router.get('/id/:id', asyncHandler(getRazonSocialById));
router.get('/rfc/:rfc', asyncHandler(getRazonSocialByRfc));
router.post('/', asyncHandler(createRazonSocial));
router.put('/:id', asyncHandler(updateRazonSocial));
router.delete('/:id', asyncHandler(deleteRazonSocial));

export default router;
