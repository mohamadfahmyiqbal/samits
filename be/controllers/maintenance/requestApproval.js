// be\controllers\maintenance\requestApproval.js
import {
  maintenanceService,
} from "./shared.js";

export default async function requestApprovalController(
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

    const result =
      await maintenanceService.requestApproval(
        planId,
        req.user
      );

    return res.status(200).json({
      success: true,
      message:
        "Approval berhasil diajukan.",
      data: result,
    });
  } catch (error) {
    console.error(
      "Gagal request approval:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Gagal mengajukan approval.",
    });
  }
}