import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import * as dashboardController from "../controllers/dashboard/Dashboard.js";

const router = express.Router();

router.get(
  "/asset-summary",
  authMiddleware,
  dashboardController.getAssetSummary,
);

router.get(
  "/maintenance-alerts",
  authMiddleware,
  dashboardController.getMaintenanceAlerts,
);

router.get(
  "/maintenance-stats",
  authMiddleware,
  dashboardController.getMaintenanceStats,
);

export default router;
