// controllers/maintenance/maintenance.controller.js

import { db } from "../../models/index.js";
import maintenanceService from "../../services/maintenance.service.js";

const statusLabels = {
  pending: "Open",
  in_progress: "In Progress",
  done: "Done",
  abnormal: "Abnormal",
  overdue: "Terlambat",
  cancelled: "Cancelled",
};

const formatStatusLabel = (status) => statusLabels[status] || status;

const formatTimeValue = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(11, 16);
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length >= 2) {
      return trimmed.length > 5 ? trimmed.slice(0, 5) : trimmed;
    }
    return trimmed;
  }
  return null;
};

const buildTimeRangeLabel = (start, end) => {
  const startLabel = formatTimeValue(start);
  const endLabel = formatTimeValue(end);
  if (startLabel && endLabel && startLabel !== endLabel) {
    return `${startLabel} - ${endLabel}`;
  }
  return startLabel || endLabel || null;
};

// 1. GET Active Logs (pending & in-progress)
export const getActiveLogs = async (req, res) => {
  try {
    const MaintenancePlan = db.MaintenancePlan;
    if (!MaintenancePlan) {
      throw new Error("Model MaintenancePlan belum tersedia.");
    }

    const logs = await MaintenancePlan.findAll({
      where: { status: ["pending", "in-progress"] },
      order: [["scheduled_date", "ASC"]],
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

    // Transform untuk frontend (timezone fix)
    const transformedLogs = logs.map((log) => {
      const assetLabel = log.hostname || log.plan_name || log.it_item_id;
      const timeRange = buildTimeRangeLabel(
        log.scheduled_start_time,
        log.scheduled_end_time,
      );

      return {
        id: log.plan_id,
        itItemId: log.it_item_id,
        hostname: log.hostname,
        assetName: assetLabel,
        planName: log.plan_name,
        category: log.category,
        type: log.maintenance_type,
        scheduledDate: log.scheduled_date,
        scheduledEndDate: log.scheduled_end_date,
        scheduledStartTime: formatTimeValue(log.scheduled_start_time),
        scheduledEndTime: formatTimeValue(log.scheduled_end_time),
        timeRange,
        pic: log.pic,
        status: log.status,
        statusLabel: formatStatusLabel(log.status),
        description: log.description || log.notes || null,
        notes: log.notes || null,
        createdBy: log.created_by,
        createdAt: log.created_at || null,
        updatedAt: log.updated_at || null,
        // New fields from database
        priority: log.priority || "medium",
        criticality: log.criticality || "medium",
        location: log.location,
        requiredSkills: log.required_skills || [],
        estimatedDuration: parseFloat(log.estimated_duration) || 2.0,
      };
    });

    return res.status(200).json({
      success: true,
      data: transformedLogs,
    });
  } catch (error) {
    console.error("Gagal mengambil active logs:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil schedule maintenance.",
    });
  }
};

// 2. GET History Logs (done & abnormal)
export const getHistoryLogs = async (req, res) => {
  try {
    const MaintenancePlan = db.MaintenancePlan;
    if (!MaintenancePlan) {
      throw new Error("Model MaintenancePlan belum tersedia.");
    }

    const logs = await MaintenancePlan.findAll({
      where: { status: ["done", "abnormal"] },
      order: [["updated_at", "DESC"]],
    });

    const transformedLogs = logs.map((log) => {
      const assetLabel = log.hostname || log.plan_name || log.it_item_id;
      const timeRange = buildTimeRangeLabel(
        log.scheduled_start_time,
        log.scheduled_end_time,
      );

      return {
        id: log.plan_id,
        itItemId: log.it_item_id,
        hostname: log.hostname,
        assetName: assetLabel,
        planName: log.plan_name,
        category: log.category,
        type: log.maintenance_type,
        scheduledDate: log.scheduled_date,
        scheduledEndDate: log.scheduled_end_date,
        scheduledStartTime: formatTimeValue(log.scheduled_start_time),
        scheduledEndTime: formatTimeValue(log.scheduled_end_time),
        timeRange,
        pic: log.pic,
        status: log.status,
        statusLabel: formatStatusLabel(log.status),
        description: log.description || log.notes || null,
        notes: log.notes || null,
        endDate: log.scheduled_end_date,
        result: log.status === "done" ? "Normal" : "Abnormal",
        executedBy: log.pic,
        archivedAt: log.updated_at,
        createdBy: log.created_by,
        createdAt: log.created_at,
        updatedAt: log.updated_at,
        priority: log.priority || "medium",
        criticality: log.criticality || "medium",
        location: log.location,
        requiredSkills: log.required_skills || [],
        estimatedDuration: parseFloat(log.estimated_duration) || 2.0,
      };
    });

    return res.status(200).json({
      success: true,
      data: transformedLogs,
    });
  } catch (error) {
    console.error("Gagal mengambil history logs:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil riwayat maintenance.",
    });
  }
};

export const getScheduleById = async (req, res) => {
  try {
    const MaintenancePlan = db.MaintenancePlan;
    if (!MaintenancePlan) {
      throw new Error("Model MaintenancePlan belum tersedia.");
    }

    const planId = parseInt(req.params.id, 10);
    if (isNaN(planId)) {
      return res.status(400).json({
        success: false,
        message: "ID schedule tidak valid.",
      });
    }

    const plan = await MaintenancePlan.findByPk(planId, {
      include: [
        {
          model: db.MaintenancePlanAsset,
          as: "assets",
        },
      ],
    });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Schedule tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      data: maintenanceService.transformPlan(plan.toJSON()),
    });
  } catch (error) {
    console.error("Gagal mengambil detail schedule:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail schedule.",
    });
  }
};

// 3. PUT Update Schedule
export const updateLog = async (req, res) => {
  try {
    const planId = parseInt(req.params.id);
    if (isNaN(planId)) {
      return res.status(400).json({
        success: false,
        message: "ID jadwal tidak valid",
      });
    }

    const result = await maintenanceService.updateSchedule(
      planId,
      req.body,
      req.user,
    );

    if (!result.success) {
      const status = result.message.includes("not found") ? 404 : 400;
      return res.status(status).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Controller updateLog failed:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 4. POST Create Schedule **(FIX: Ditambahkan lengkap)**
export const createLog = async (req, res) => {
  try {
    const takeFirstValue = (value) =>
      Array.isArray(value) && value.length > 0 ? value[0] : value;
    const firstHostname = takeFirstValue(req.body?.hostname);

    console.log(
      "[DEBUG] createLog received req.body:",
      JSON.stringify(req.body, null, 2),
    );

    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Payload jadwal tidak boleh kosong",
      });
    }

    const camelPayload = {
      ...req.body,
      itItemId:
        req.body.itItemId || req.body.it_item_id || firstHostname || req.body.hostname,
      selected_assets: req.body.selected_assets || req.body.assets,
      scheduledDate:
        req.body.scheduledDate ||
        req.body.scheduled_date ||
        req.body.start_date,
      scheduledEndDate:
        req.body.scheduledEndDate ||
        req.body.scheduled_end_date ||
        req.body.end_date,
      scheduledTime:
        req.body.scheduledTime ||
        req.body.scheduled_time ||
        req.body.start_time,
      scheduledEndTime:
        req.body.scheduledEndTime ||
        req.body.scheduled_end_time ||
        req.body.end_time,
    };

    console.log(
      "[DEBUG] camelPayload after mapping:",
      JSON.stringify(camelPayload, null, 2),
    );

    if (!camelPayload.itItemId || !camelPayload.scheduledDate) {
      console.log(
        "[DEBUG] Validation failed - itItemId:",
        camelPayload.itItemId,
        "scheduledDate:",
        camelPayload.scheduledDate,
      );
      return res.status(400).json({
        success: false,
        message: "Required: it_item_id dan scheduled_date",
      });
    }

    const result = await maintenanceService.createSchedule(
      camelPayload,
      req.user,
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Schedule berhasil dibuat",
      data: result.data,
    });
  } catch (error) {
    console.error("Controller createLog failed:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 5. DELETE Schedule CASCADE (Plan + WorkOrders)
export const deleteLog = async (req, res) => {
  try {
    const planId = req.params.id;

    const result = await maintenanceService.deleteSchedule(planId, req.user);

    if (!result.success) {
      const status = result.message.includes("tidak ditemukan")
        ? 404
        : result.message.includes("PENDING")
          ? 403
          : 400;
      return res.status(status).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Controller deleteLog failed:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 6. POST Request Approval
export const requestApproval = async (req, res) => {
  try {
    const planId = parseInt(req.params.id, 10);
    const MaintenancePlan = db.MaintenancePlan;
    const ApprovalHistory = db.ApprovalHistory;

    if (!MaintenancePlan || !ApprovalHistory) {
      throw new Error("Model maintenance atau approval tidak tersedia.");
    }

    if (isNaN(planId)) {
      return res.status(400).json({
        success: false,
        message: "ID schedule tidak valid",
      });
    }

    const schedule = await MaintenancePlan.findByPk(planId);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule tidak ditemukan",
      });
    }

    if (!["pending", "in-progress"].includes(schedule.status)) {
      return res.status(403).json({
        success: false,
        message:
          "Hanya schedule pending atau in-progress yang bisa diminta approval",
      });
    }

    await ApprovalHistory.create({
      document_type: "maintenance_plan",
      document_id: String(schedule.plan_id),
      level_id: 1,
      approver_nik: req.user?.nik || null,
      status: "requested",
      notes: req.body?.notes || "Permintaan approval jadwal maintenance",
      created_at: new Date(),
      updated_at: new Date(),
      step_sequence: 1,
    });

    return res.status(201).json({
      success: true,
      message: "Permintaan approval berhasil dikirim",
    });
  } catch (error) {
    console.error("Gagal mengirim permintaan approval:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengirim approval maintenance",
    });
  }
};
