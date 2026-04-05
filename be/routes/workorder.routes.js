// routes/workorder.routes.js
import express from 'express';
import * as woController from '../controllers/workorder/workorder.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(authMiddleware);

// Work Orders
router.post('/', woController.createWorkOrder);
router.get('/', woController.listWorkOrders);
router.delete('/:id', woController.deleteWorkOrder);
router.put('/:id', woController.updateWorkOrder);
router.get('/technicians', woController.getTechnicians);
router.get('/stats', woController.getWorkOrderStats);
router.patch('/:id/start', woController.startWorkOrder);
router.post('/:id/assign', woController.assignWorkOrder);
router.put('/:wo_id/complete', woController.completeWorkOrder);

// Maintenance Plans
router.post('/plans', woController.createPlan);
router.get('/plans', woController.listPlans);

export default router;
