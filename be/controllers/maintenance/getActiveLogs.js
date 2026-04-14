// be\controllers\maintenance\getActiveLogs.js
import {
  db,
  formatStatusLabel,
  formatTimeValue,
  buildTimeRangeLabel,
} from "./shared.js";

export default async function getActiveLogsController(
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
            "pending",
            "in-progress",
          ],
        },
        order: [
          ["scheduled_date", "ASC"],
        ],
        attributes: [
          "plan_id",
          "it_item_id",
          "hostname",
          "plan_name",
          "category",
          "maintenance_type",
          "scheduled_date",
          "scheduled_end_date",
          "scheduled_start_time",
          "scheduled_end_time",
          "pic",
          "status",
          "description",
          "notes",
          "created_by",
          "priority",
          "criticality",
          "location",
          "required_skills",
          "estimated_duration",
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
          createdBy:
            log.created_by,
          createdAt:
            log.created_at ||
            null,
          updatedAt:
            log.updated_at ||
            null,
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
      "Gagal mengambil active logs:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Gagal mengambil schedule maintenance.",
    });
  }
}