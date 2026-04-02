
// routes/inventory.routes.js
import express from 'express';
import * as inventoryController from '../controllers/inventory/inventory.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(authMiddleware);

// Spare Parts
router.get('/parts', inventoryController.listParts);
router.post('/parts/transaction', inventoryController.createTransaction); // Consumptio/Adjustment
router.get('/transactions', inventoryController.listTransactions);
router.get('/transactions/summary', inventoryController.getTransactionsSummary);
router.get('/transactions/export', inventoryController.exportTransactions);
router.get('/summary', inventoryController.getSummary);
router.get('/alerts', inventoryController.getAlerts);

// Tools
router.get('/tools', inventoryController.listTools);

export default router;
