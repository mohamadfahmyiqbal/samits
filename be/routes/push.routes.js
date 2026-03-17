import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import {
  getPushPublicKey,
  getPushStatus,
  sendPushBroadcast,
  subscribePush
} from '../controllers/push/push.controller.js';

const router = express.Router();

router.get('/public-key', getPushPublicKey);
router.get('/status', authMiddleware, getPushStatus);
router.post('/subscribe', authMiddleware, subscribePush);
router.post('/send', authMiddleware, sendPushBroadcast);

export default router;
