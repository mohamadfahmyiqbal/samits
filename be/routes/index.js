// routes/index.js (KOREKSI FINAL - Tambah Maintenance Routes)

import express from "express";

// Import semua modular routes
import userRoutes from "./user.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import assetRoutes from "./asset.routes.js";
// ✅ BARU: Import routes untuk Maintenance Log
import maintenanceChecklistRoutes from "./maintenance.checklist.routes.js";
import maintenanceRoutes from "./maintenance.routes.js";
import pushRoutes from "./push.routes.js";
import workorderRoutes from "./workorder.routes.js";
import approvalRoutes from "./approval.routes.js";
import masterRoutes from "./master.routes.js";
import inventoryRoutes from "./inventory.routes.js";

const router = express.Router();

// Definisikan prefix untuk setiap modul
// Contoh: /api/users/login
router.use("/users", userRoutes);

// Contoh: /api/dashboard/...
router.use("/dashboard", dashboardRoutes);
router.use("/assets", assetRoutes);

// ✅ BARU: Daftarkan Maintenance Checklists sebelum general maintenance agar tidak tertangkap parameter
router.use("/maintenance/checklists", maintenanceChecklistRoutes);
router.use("/maintenance", maintenanceRoutes);
router.use("/push", pushRoutes);
router.use("/workorder", workorderRoutes);
router.use("/approval", approvalRoutes);
router.use("/master", masterRoutes);
router.use("/inventory", inventoryRoutes);

export default router;
