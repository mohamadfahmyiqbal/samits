// be\controllers\maintenance\getHistoryLogs.js
import {
  db,
  formatStatusLabel,
  formatTimeValue,
  buildTimeRangeLabel,
} from "./shared.js";

export default async function getHistoryLogsController(
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

    const logs =
      await MaintenancePlan.findAll({
        where: {
          status: [
            "done",
            "abnormal",
          ],
        },
        order: [
          ["updated_at", "DESC"],
        ],
      });

    const transformedLogs =
      logs.map((log) => {
        const assetLabel =
          log.hostname ||
          log.plan_name ||
          log.it_item_id;

        const timeRange =
          buildTimeRangeLabel(
            log.scheduled_start_time,
            log.scheduled_end_time
          );

        return {
          id: log.plan_id,
          itItemId: log.it_item_id,
          hostname: log.hostname,
          assetName: assetLabel,
          planName: log.plan_name,
          category: log.category,
          type: log.maintenance_type,
          scheduledDate:
            log.scheduled_date,
          scheduledEndDate:
            log.scheduled_end_date,
          scheduledStartTime:
            formatTimeValue(
              log.scheduled_start_time
            ),
          scheduledEndTime:
            formatTimeValue(
              log.scheduled_end_time
            ),
          timeRange,
          pic: log.pic,
          status: log.status,
          statusLabel:
            formatStatusLabel(
              log.status
            ),
          description:
            log.description ||
            log.notes ||
            null,
          notes:
            log.notes || null,
          endDate:
            log.scheduled_end_date,
          result:
            log.status === "done"
              ? "Normal"
              : "Abnormal",
          executedBy: log.pic,
          archivedAt:
            log.updated_at,
          createdBy:
            log.created_by,
          createdAt:
            log.created_at,
          updatedAt:
            log.updated_at,
          priority:
            log.priority ||
            "medium",
          criticality:
            log.criticality ||
            "medium",
          location:
            log.location,
          requiredSkills:
            log.required_skills ||
            [],
          estimatedDuration:
            parseFloat(
              log.estimated_duration
            ) || 2.0,
        };
      });

    return res.status(200).json({
      success: true,
      data: transformedLogs,
    });
  } catch (error) {
    console.error(
      "Gagal mengambil history logs:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Gagal mengambil riwayat maintenance.",
    });
  }
}