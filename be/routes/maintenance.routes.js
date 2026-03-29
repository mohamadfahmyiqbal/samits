// routes/maintenance/maintenance.routes.js

import express from 'express';
import * as maintenanceController from '../controllers/maintenance/maintenance.controller.js';
import authMiddleware from '../middleware/auth.middleware.js'; 

const router = express.Router();

// Route untuk log aktif dan riwayat (Public)
router.get('/active', maintenanceController.getActiveLogs);
router.get('/history', maintenanceController.getHistoryLogs);

// Route untuk membuat schedule baru (Memerlukan otentikasi)
router.post('/', authMiddleware, maintenanceController.createLog);

// Route untuk pembaruan status log (Memerlukan otentikasi)
router.put('/:id', authMiddleware, maintenanceController.updateLog);

// Route DELETE schedule (hanya pending, auth required)
router.delete('/:id', authMiddleware, maintenanceController.deleteLog);

// Route permintaan approval
router.post('/:id/request-approval', authMiddleware, maintenanceController.requestApproval);

export default router;
