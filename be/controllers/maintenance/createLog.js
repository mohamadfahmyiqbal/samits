// be\controllers\maintenance\createLog.js
import {
  maintenanceService,
} from "./shared.js";

export default async function createLogController(
  req,
  res
) {
  try {
    const payload = {
      ...req.body,
      created_by:
        req.user?.username ||
        req.user?.name ||
        "system",
    };

    const result =
      await maintenanceService.createLog(
        payload
      );

    return res.status(201).json({
      success: true,
      message:
        "Schedule maintenance berhasil dibuat.",
      data: result,
    });
  } catch (error) {
    console.error(
      "Gagal membuat schedule:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Gagal membuat schedule maintenance.",
    });
  }
}