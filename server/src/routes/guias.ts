import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { getGuias, createGuia, updateGuia, deleteGuia } from '../controllers/guiaController';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.get('/', asyncHandler(getGuias));
router.post('/', asyncHandler(createGuia));
router.put('/:id', asyncHandler(updateGuia));
router.delete('/:id', asyncHandler(deleteGuia));

export default router;
