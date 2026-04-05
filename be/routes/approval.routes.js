/* be/routes/approval.routes.js - Approval API Routes
* Modular routes untuk approval workflows
*/

import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import {
  createAssetApprovalRequest,
  getAssetApprovalStatus,
  approveAssetApproval,
  rejectAssetApproval
} from '../controllers/approval/assetApprovalController.js';

const router = express.Router();

// Asset Approval Routes (protected)
router.post('/asset/:noAsset/request', authMiddleware, createAssetApprovalRequest);
router.get('/asset/:noAsset/status', authMiddleware, getAssetApprovalStatus);
router.post('/asset/:approvalId/approve', authMiddleware, approveAssetApproval);
router.post('/asset/:approvalId/reject', authMiddleware, rejectAssetApproval);

export default router;

