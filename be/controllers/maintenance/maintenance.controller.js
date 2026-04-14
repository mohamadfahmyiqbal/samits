// controllers/maintenance/maintenance.controller.js
import {
  db,
  maintenanceService,
  formatStatusLabel,
  formatTimeValue,
  buildTimeRangeLabel,
} from "./shared.js";

// 1. GET Active Logs (pending & in-progress)
export { default as getActiveLogs } from "./getActiveLogs.js";

// 2. GET History Logs (done & abnormal)
export { default as getHistoryLogs } from "./getHistoryLogs.js";

// 3. GET Schedule by ID
export { default as getScheduleById } from "./getScheduleById.js";

// 4. PUT Update Schedule
export { default as updateLog } from "./updateLog.js";

// 5. POST Create Schedule **(FIX: Ditambahkan lengkap)**
export { default as createLog } from "./createLog.js";

// 6. DELETE Schedule CASCADE (Plan + WorkOrders)
export { default as deleteLog } from "./deleteLog.js";

// 7. POST Request Approval
export { default as requestApproval } from "./requestApproval.js";
