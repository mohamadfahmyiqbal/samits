// routes/index.js (KOREKSI FINAL - Tambah Maintenance Routes)

import express from 'express';

// Import semua modular routes
import userRoutes from './user.routes.js';
import dashboardRoutes from './dashboard.routes.js'; 
import assetRoutes from './AssetRoutes.js';
// ✅ BARU: Import routes untuk Maintenance Log
import maintenanceRoutes from './maintenance.routes.js'; 
import pushRoutes from './push.routes.js';
import workorderRoutes from './workorder.routes.js';
import approvalRoutes from './approval.routes.js';

const router = express.Router();

// Definisikan prefix untuk setiap modul
// Contoh: /api/users/login
router.use('/users', userRoutes);

// Contoh: /api/dashboard/...
router.use('/dashboard', dashboardRoutes); 
router.use('/assets', assetRoutes);

// ✅ BARU: Daftarkan Maintenance Routes di prefix /api/maintenance
router.use('/maintenance', maintenanceRoutes); 
router.use('/push', pushRoutes);
router.use('/workorder', workorderRoutes);
router.use('/approval', approvalRoutes);

export default router;
