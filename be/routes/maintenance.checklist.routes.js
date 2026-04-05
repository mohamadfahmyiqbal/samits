import express from 'express';
import * as checklistController from '../controllers/maintenance/checklist.controller.js';
import * as checklistTemplateController from '../controllers/maintenance/checklistTemplate.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, checklistController.listChecklists);
router.get('/templates', authMiddleware, checklistTemplateController.listTemplates);
router.post('/templates', authMiddleware, checklistTemplateController.createTemplate);
router.get('/:id', authMiddleware, checklistController.getChecklist);
router.post('/', authMiddleware, checklistController.createChecklist);
router.put('/:id', authMiddleware, checklistController.updateChecklist);
router.delete('/:id', authMiddleware, checklistController.deleteChecklist);

export default router;
