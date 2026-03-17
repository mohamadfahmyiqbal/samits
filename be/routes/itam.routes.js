
// routes/itam.routes.js
import express from 'express';
import * as itamController from '../controllers/item/itam.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(authMiddleware);

// IT Assets
router.post('/items', itamController.createITItem);
router.get('/items', itamController.listITItems);

// Licenses
router.post('/licenses', itamController.createLicense);
router.post('/licenses/allocate', itamController.allocateLicense);

export default router;