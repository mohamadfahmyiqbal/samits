
// routes/inventory.routes.js
import express from 'express';
import * as inventoryController from '../controllers/inventory/inventory.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(authMiddleware);

// Spare Parts
router.get('/parts', inventoryController.listParts);
router.post('/parts/transaction', inventoryController.createTransaction); // Consumptio/Adjustment

// Tools
router.get('/tools', inventoryController.listTools);

export default router;