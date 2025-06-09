import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { getClientes, createCliente, updateCliente, deleteCliente } from '../controllers/clienteController';

const router = Router();

// Helper para manejar errores de funciones async
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.get('/', asyncHandler(getClientes));
router.post('/', asyncHandler(createCliente));
router.put('/:id', asyncHandler(updateCliente));
router.delete('/:id', asyncHandler(deleteCliente));

export default router;
