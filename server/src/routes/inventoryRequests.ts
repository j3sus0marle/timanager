import express from 'express';
import { InventoryRequestController } from '../controllers/inventoryRequestController';
import { isAuthenticated, isAdmin } from '../middleware/auth';

const router = express.Router();

// Rutas para usuarios normales (no requieren autenticación)
router.post('/', InventoryRequestController.createRequest);
router.get('/my-requests', isAuthenticated, InventoryRequestController.getUserRequests);

// Rutas para administradores
router.get('/pending', isAuthenticated, isAdmin, InventoryRequestController.getPendingRequests);
router.post('/:requestId/process', isAuthenticated, isAdmin, InventoryRequestController.processRequest);

export default router;