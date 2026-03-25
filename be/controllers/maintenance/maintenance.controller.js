// controllers/maintenance/maintenance.controller.js

import { db } from "../../models/index.js";

// 1. GET: Ambil Log Aktif (scheduled maintenance)
export const getActiveLogs = async (req, res) => {
  try {
    const MaintenancePlan = db.MaintenancePlan;
    if (!MaintenancePlan) {
      throw new Error("Model MaintenancePlan belum tersedia.");
    }

    // Ambil schedule yang aktif (is_active = true)
    const logs = await MaintenancePlan.findAll({
      where: {
        is_active: true,
      },
      order: [["next_due_date", "ASC"]],
    });

    console.log("Found logs:", logs.length);

    // Transform data untuk frontend
    const transformedLogs = logs.map((log) => ({
      id: log.plan_id,
      assetId: log.asset_id,
      planName: log.plan_name,
      planType: log.plan_type,
      frequency: log.frequency,
      nextDueDate: log.next_due_date,
      isActive: log.is_active,
    }));

    return res.status(200).json({ data: transformedLogs });
  } catch (error) {
    console.error("Gagal mengambil active logs:", error);
    return res
      .status(500)
      .json({ message: "Gagal mengambil schedule maintenance." });
  }
};

// 2. GET: Ambil Log Riwayat (schedule yang sudah selesai)
export const getHistoryLogs = async (req, res) => {
  try {
    const MaintenancePlan = db.MaintenancePlan;
    if (!MaintenancePlan) {
      throw new Error("Model MaintenancePlan belum tersedia.");
    }

    // Ambil schedule yang aktif sebagai history (karena tidak ada kolom status)
    const logs = await MaintenancePlan.findAll({
      where: {
        is_active: false, // Anggap yang tidak aktif sebagai history
      },
      order: [["plan_id", "DESC"]], // Gunakan plan_id sebagai pengganti updated_at
    });

    // Transform data untuk frontend - hanya gunakan kolom yang ada
    const transformedLogs = logs.map((log) => ({
      id: log.plan_id,
      assetId: log.asset_id,
      planName: log.plan_name,
      planType: log.plan_type,
      frequency: log.frequency,
      nextDueDate: log.next_due_date,
      isActive: log.is_active,
      // Default values untuk kolom yang tidak ada di tabel
      itItemId: null,
      hostname: null,
      category: log.plan_type, // Gunakan plan_type sebagai category
      type: log.plan_type,
      scheduledDate: log.next_due_date,
      scheduledEndDate: log.next_due_date,
      scheduledStartTime: null,
      scheduledEndTime: null,
      pic: null,
      status: log.is_active ? "active" : "completed", // Berdasarkan is_active
      description: null,
      notes: null,
      endDate: log.next_due_date,
      result: log.is_active ? "Pending" : "Normal",
      executedBy: null,
      archivedAt: null,
      createdBy: null,
      createdAt: null,
      updatedAt: null,
    }));

    return res.status(200).json({ data: transformedLogs });
  } catch (error) {
    console.error("Gagal mengambil history logs:", error);
    return res
      .status(500)
      .json({ message: "Gagal mengambil riwayat maintenance." });
  }
};

// 3. PUT: Update Log (status, detail, dll.)
export const updateLog = async (req, res) => {
  try {
    const planId = parseInt(req.params.id);
    const updatePayload = req.body;

    const MaintenancePlan = db.MaintenancePlan;
    if (!MaintenancePlan) {
      throw new Error("Model MaintenancePlan belum tersedia.");
    }

    if (isNaN(planId)) {
      return res.status(400).json({
        success: false,
        message: "ID jadwal tidak valid",
      });
    }

    const existingLog = await MaintenancePlan.findByPk(planId);

    if (!existingLog) {
      return res.status(404).json({
        success: false,
        message: "Schedule tidak ditemukan",
      });
    }

    // Hanya izinkan edit jika masih aktif
    if (existingLog.is_active === false) {
      return res.status(403).json({
        success: false,
        message: "Schedule tidak dapat diedit (status: completed)",
      });
    }

    // Filter updatePayload untuk hanya menyertakan kolom yang ada
    const allowedUpdates = {};
    if (updatePayload.plan_name !== undefined)
      allowedUpdates.plan_name = updatePayload.plan_name;
    if (updatePayload.asset_id !== undefined)
      allowedUpdates.asset_id = updatePayload.asset_id;
    if (updatePayload.plan_type !== undefined)
      allowedUpdates.plan_type = updatePayload.plan_type;
    if (updatePayload.frequency !== undefined)
      allowedUpdates.frequency = updatePayload.frequency;
    if (updatePayload.next_due_date !== undefined)
      allowedUpdates.next_due_date = updatePayload.next_due_date;
    if (updatePayload.is_active !== undefined)
      allowedUpdates.is_active = updatePayload.is_active;

    await existingLog.update(allowedUpdates);

    const updatedLog = await MaintenancePlan.findByPk(planId); // Refresh data
    const updatedLogJSON = updatedLog.toJSON();

    // Format response standar per rules - hanya gunakan kolom yang ada
    const transformedLog = {
      id: updatedLogJSON.plan_id,
      assetId: updatedLogJSON.asset_id,
      planName: updatedLogJSON.plan_name,
      planType: updatedLogJSON.plan_type,
      frequency: updatedLogJSON.frequency,
      nextDueDate: updatedLogJSON.next_due_date,
      isActive: updatedLogJSON.is_active,
      // Default values untuk kolom yang tidak ada
      itItemId: null,
      hostname: null,
      category: updatedLogJSON.plan_type,
      type: updatedLogJSON.plan_type,
      scheduledDate: updatedLogJSON.next_due_date,
      scheduledEndDate: updatedLogJSON.next_due_date,
      scheduledStartTime: null,
      scheduledEndTime: null,
      pic: null,
      status: updatedLogJSON.is_active ? "active" : "completed",
      detail: null,
      notes: null,
      createdBy: null,
      createdAt: null,
      updatedAt: null,
    };

    return res.status(200).json({
      success: true,
      message: "Schedule berhasil diperbarui",
      data: transformedLog,
    });
  } catch (error) {
    console.error("Gagal memperbarui log:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui schedule maintenance",
    });
  }
};

// 4. POST: Buat Log Baru
export const createLog = async (req, res) => {
  try {
    const newLogData = req.body;

    if (!newLogData.assetId || !newLogData.nextDueDate) {
      return res
        .status(400)
        .json({ message: "Asset ID dan Next Due Date wajib diisi" });
    }

    const MaintenancePlan = db.MaintenancePlan;
    if (!MaintenancePlan) {
      throw new Error("Model MaintenancePlan belum tersedia.");
    }

    const startDate = new Date(newLogData.nextDueDate);
    const endDate = newLogData.nextDueDate
      ? new Date(newLogData.nextDueDate)
      : startDate;

    // Single day creation
    const newPlan = await MaintenancePlan.create({
      asset_id: newLogData.assetId,
      plan_name:
        newLogData.planName ||
        `Maintenance Plan ${newLogData.planType || "Schedule"}`,
      plan_type: newLogData.planType || "preventive",
      frequency: newLogData.frequency || "monthly",
      next_due_date: newLogData.nextDueDate,
      is_active: true,
    });
    const savedPlan = newPlan.toJSON();
    const transformedPlan = {
      id: savedPlan.plan_id,
      assetId: savedPlan.asset_id,
      planName: savedPlan.plan_name,
      planType: savedPlan.plan_type,
      frequency: savedPlan.frequency,
      nextDueDate: savedPlan.next_due_date,
      isActive: savedPlan.is_active,
      // Default values for missing fields
      itItemId: null,
      hostname: null,
      category: savedPlan.plan_type,
      type: savedPlan.plan_type,
      scheduledDate: savedPlan.next_due_date,
      scheduledEndDate: savedPlan.next_due_date,
      scheduledStartTime: null,
      scheduledEndTime: null,
      pic: null,
      status: savedPlan.is_active ? "active" : "completed",
      detail: null,
      notes: null,
      createdBy: null,
      createdAt: null,
      updatedAt: null,
    };

    return res.status(201).json({
      message: "Schedule berhasil ditambahkan",
      data: transformedPlan,
    });
  } catch (error) {
    console.error("Gagal membuat log:", error);
    res.status(500).json({ message: "Gagal membuat schedule maintenance" });
  }
};

// 5. DELETE: Hapus Schedule (hanya pending)
export const deleteLog = async (req, res) => {
  try {
    const planId = req.params.id;
    const MaintenancePlan = db.MaintenancePlan;

    if (!MaintenancePlan) {
      throw new Error("Model MaintenancePlan belum tersedia.");
    }

    const schedule = await MaintenancePlan.findByPk(planId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule tidak ditemukan" });
    }

    if (schedule.is_active === false) {
      return res
        .status(403)
        .json({ message: "Hanya schedule yang aktif yang boleh dihapus" });
    }

    await schedule.destroy();

    return res.status(200).json({
      message: "Schedule berhasil dihapus",
      deletedId: planId,
    });
  } catch (error) {
    console.error("Gagal menghapus schedule:", error);
    res.status(500).json({ message: "Gagal menghapus schedule maintenance" });
  }
};
