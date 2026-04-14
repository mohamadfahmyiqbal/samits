// be\controllers\maintenance\getScheduleById.js
import {
  db,
  maintenanceService,
} from "./shared.js";

export default async function getScheduleByIdController(
  req,
  res
) {
  try {
    const MaintenancePlan =
      db.MaintenancePlan;

    if (!MaintenancePlan) {
      throw new Error(
        "Model MaintenancePlan belum tersedia."
      );
    }

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

    const plan =
      await MaintenancePlan.findByPk(
        planId,
        {
          include: [
            {
              model:
                db.MaintenancePlanAsset,
              as: "assets",
            },
          ],
        }
      );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message:
          "Schedule tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      data: maintenanceService.transformPlan(
        plan.toJSON()
      ),
    });
  } catch (error) {
    console.error(
      "Gagal mengambil detail schedule:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Gagal mengambil detail schedule.",
    });
  }
}