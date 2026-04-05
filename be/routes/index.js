// routes/index.js (KOREKSI FINAL - Tambah Maintenance Routes)

console.log("⏳ routes/index.js loading...");
import express from "express";
console.log("✅ express imported in routes");

// Import semua modular routes
import userRoutes from "./user.routes.js";
console.log("✅ userRoutes imported");
import dashboardRoutes from "./dashboard.routes.js";
console.log("✅ dashboardRoutes imported");
import assetRoutes from "./asset.routes.js";
console.log("✅ assetRoutes imported");
// ✅ BARU: Import routes untuk Maintenance Log
import maintenanceChecklistRoutes from "./maintenance.checklist.routes.js";
console.log("✅ maintenanceChecklistRoutes imported");
import maintenanceRoutes from "./maintenance.routes.js";
console.log("✅ maintenanceRoutes imported");
import pushRoutes from "./push.routes.js";
console.log("✅ pushRoutes imported");
import workorderRoutes from "./workorder.routes.js";
console.log("✅ workorderRoutes imported");
import approvalRoutes from "./approval.routes.js";
console.log("✅ approvalRoutes imported");
import masterRoutes from "./master.routes.js";
console.log("✅ masterRoutes imported");
import inventoryRoutes from "./inventory.routes.js";
console.log("✅ inventoryRoutes imported");

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

console.log("✅ routes/index.js exports ready");
export default router;
