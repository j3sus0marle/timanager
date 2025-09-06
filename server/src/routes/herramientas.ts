import express, { Router } from 'express';
import {
  getHerramientas,
  getHerramientasByColaborador,
  createHerramienta,
  updateHerramienta,
  deleteHerramienta
} from '../controllers/herramientaController';

const router: Router = express.Router();

router.get('/', getHerramientas as express.RequestHandler);
router.get('/colaborador/:colaboradorId', getHerramientasByColaborador as express.RequestHandler);
router.post('/', createHerramienta as express.RequestHandler);
router.put('/:id', updateHerramienta as express.RequestHandler);
router.delete('/:id', deleteHerramienta as express.RequestHandler);

export default router;
