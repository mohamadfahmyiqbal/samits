// be\controllers\maintenance\deleteLog.js
import {
  maintenanceService,
} from "./shared.js";

export default async function deleteLogController(
  req,
  res
) {
  try {
    const planId = parseInt(
      req.params.id,
      10
    );

    if (isNaN(planId)) {
      return res.status(400).json({
        success: false,
        message:
          "ID schedule tidak valid.",
      });
    }

    await maintenanceService.deleteLog(
      planId
    );

    return res.status(200).json({
      success: true,
      message:
        "Schedule maintenance berhasil dihapus.",
    });
  } catch (error) {
    console.error(
      "Gagal menghapus schedule:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Gagal menghapus schedule maintenance.",
    });
  }
}