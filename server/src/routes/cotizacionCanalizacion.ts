import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { 
  getCotizacionesCanalizacion, 
  getCotizacionCanalizacionById, 
  createCotizacionCanalizacion, 
  updateCotizacionCanalizacion, 
  deleteCotizacionCanalizacion,
  searchCotizacionesCanalizacion,
  cambiarEstadoCotizacion
} from '../controllers/cotizacionCanalizacionController';

const router = Router();

// Helper para manejar errores de funciones async
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Rutas para cotizaciones de canalización
router.get('/', asyncHandler(getCotizacionesCanalizacion));
router.get('/search', asyncHandler(searchCotizacionesCanalizacion));
router.get('/:id', asyncHandler(getCotizacionCanalizacionById));
router.post('/', asyncHandler(createCotizacionCanalizacion));
router.put('/:id', asyncHandler(updateCotizacionCanalizacion));
router.put('/:id/estado', asyncHandler(cambiarEstadoCotizacion));
router.delete('/:id', asyncHandler(deleteCotizacionCanalizacion));

export default router;
