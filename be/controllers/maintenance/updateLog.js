// be\controllers\maintenance\updateLog.js
import {
  maintenanceService,
} from "./shared.js";

export default async function updateLogController(
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

    const payload = {
      ...req.body,
      updated_by:
        req.user?.username ||
        req.user?.name ||
        "system",
    };

    const result =
      await maintenanceService.updateLog(
        planId,
        payload
      );

    return res.status(200).json({
      success: true,
      message:
        "Schedule maintenance berhasil diperbarui.",
      data: result,
    });
  } catch (error) {
    console.error(
      "Gagal update schedule:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Gagal memperbarui schedule maintenance.",
    });
  }
}