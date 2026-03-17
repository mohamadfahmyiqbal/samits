// controllers/maintenance/maintenance.controller.js

import { db } from "../../models/index.js";

// 1. GET: Ambil Log Aktif (scheduled maintenance)
export const getActiveLogs = async (req, res) => {
    try {
        const MaintenancePlan = db.MaintenancePlan;
        if (!MaintenancePlan) {
            throw new Error("Model MaintenancePlan belum tersedia.");
        }

        // Ambil schedule yang statusnya pending atau in-progress
        const logs = await MaintenancePlan.findAll({
            where: {
                status: ['pending', 'in-progress']
            },
            order: [['scheduled_date', 'ASC']]
        });

// Transform data untuk frontend - ✅ TIMEZONE FIX
        const formatTime = (time) => time ? time.toISOString().slice(11,16) : null;
        const transformedLogs = logs.map(log => ({
            id: log.plan_id,
            itItemId: log.it_item_id,
            hostname: log.hostname,
            category: log.category,
            type: log.maintenance_type,
            scheduledDate: log.scheduled_date,
            scheduledEndDate: log.scheduled_end_date,
            scheduledStartTime: formatTime(log.scheduled_start_time),
            scheduledEndTime: formatTime(log.scheduled_end_time),
            pic: log.pic,
            status: log.status,
            description: log.description || log.notes || null,
            notes: log.notes || null,
            planName: log.plan_name,
            createdBy: log.created_by,
            createdAt: log.created_at,
            updatedAt: log.updated_at
        }));    

        return res.status(200).json({ data: transformedLogs });
    } catch (error) {
        console.error("Gagal mengambil active logs:", error);
        return res.status(500).json({ message: "Gagal mengambil schedule maintenance." });
    }
};

// 2. GET: Ambil Log Riwayat (schedule yang sudah selesai)
export const getHistoryLogs = async (req, res) => {
    try {
        const MaintenancePlan = db.MaintenancePlan;
        if (!MaintenancePlan) {
            throw new Error("Model MaintenancePlan belum tersedia.");
        }

        // Ambil schedule yang statusnya done atau abnormal
        const logs = await MaintenancePlan.findAll({
            where: {
                status: ['done', 'abnormal']
            },
            order: [['updated_at', 'DESC']]
        });

        // Transform data untuk frontend - ✅ TIMEZONE FIX
        const formatTime = (time) => time ? time.toISOString().slice(11,16) : null;
        const transformedLogs = logs.map(log => ({
            id: log.plan_id,
            itItemId: log.it_item_id,
            hostname: log.hostname,
            category: log.category,
            type: log.maintenance_type,
            scheduledDate: log.scheduled_date,
            scheduledEndDate: log.scheduled_end_date,
            scheduledStartTime: formatTime(log.scheduled_start_time),
            scheduledEndTime: formatTime(log.scheduled_end_time),
            pic: log.pic,
            status: log.status,
            description: log.description || log.notes || null,
            notes: log.notes || null,
            planName: log.plan_name,
            endDate: log.scheduled_end_date,
            result: log.status === 'done' ? 'Normal' : 'Abnormal',
            executedBy: log.pic,
            archivedAt: log.updated_at,
            createdBy: log.created_by,
            createdAt: log.created_at,
            updatedAt: log.updated_at
        }));  

        return res.status(200).json({ data: transformedLogs });
    } catch (error) {
        console.error("Gagal mengambil history logs:", error);
        return res.status(500).json({ message: "Gagal mengambil riwayat maintenance." });
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
                message: "ID jadwal tidak valid" 
            });
        }

        const existingLog = await MaintenancePlan.findByPk(planId);

        if (!existingLog) {
            return res.status(404).json({ 
                success: false,
                message: "Schedule tidak ditemukan" 
            });
        }

        // Hanya izinkan edit jika status pending atau in-progress
        if (!['pending', 'in-progress'].includes(existingLog.status)) {
            return res.status(403).json({ 
                success: false,
                message: "Schedule tidak dapat diedit (status: " + existingLog.status + ")" 
            });
        }

        await existingLog.update({
            ...updatePayload,
            updated_at: db.sequelize.literal('GETDATE()')
        });

        const updatedLog = await MaintenancePlan.findByPk(planId); // Refresh data
        const updatedLogJSON = updatedLog.toJSON();
        
        // Format response standar per rules
        const formatTime = (time) => time ? time.toISOString().slice(11,16) : null;
        const transformedLog = {
            id: updatedLogJSON.plan_id,
            itItemId: updatedLogJSON.it_item_id,
            hostname: updatedLogJSON.hostname,
            category: updatedLogJSON.category,
            type: updatedLogJSON.maintenance_type,
            scheduledDate: updatedLogJSON.scheduled_date,
            scheduledEndDate: updatedLogJSON.scheduled_end_date,
            scheduledStartTime: formatTime(updatedLogJSON.scheduled_start_time),
            scheduledEndTime: formatTime(updatedLogJSON.scheduled_end_time),
            pic: updatedLogJSON.pic,
            status: updatedLogJSON.status,
            detail: updatedLogJSON.description,
            notes: updatedLogJSON.notes || null,
            planName: updatedLogJSON.plan_name,
            createdBy: updatedLogJSON.created_by,
            createdAt: updatedLogJSON.created_at,
            updatedAt: updatedLogJSON.updated_at
        };

        return res.status(200).json({ 
            success: true,
            message: "Schedule berhasil diperbarui",
            data: transformedLog 
        });
    } catch (error) {
        console.error("Gagal memperbarui log:", error);
        res.status(500).json({ 
            success: false,
            message: "Gagal memperbarui schedule maintenance" 
        });
    }
};

// 4. POST: Buat Log Baru
export const createLog = async (req, res) => {
    try {
        const newLogData = req.body;
        
        if (!newLogData.itItemId || !newLogData.scheduledDate) {
            return res.status(400).json({ message: "IT Item ID dan Scheduled Date wajib diisi" });
        }

        const MaintenancePlan = db.MaintenancePlan;
        if (!MaintenancePlan) {
            throw new Error("Model MaintenancePlan belum tersedia.");
        }

        const createdBy = req.user?.name || req.user?.username || "Unknown User";

        const startDate = new Date(newLogData.scheduledDate);
        const endDate = newLogData.scheduledEndDate ? new Date(newLogData.scheduledEndDate) : startDate;
        
        if (endDate < startDate) {
            return res.status(400).json({ message: "Tanggal selesai tidak boleh sebelum tanggal mulai" });
        }

        // Single day
        if (startDate.getTime() === endDate.getTime() || !newLogData.scheduledEndDate) {
            const formattedStartDate = newLogData.scheduledDate;
            const formattedEndDate = newLogData.scheduledEndDate || newLogData.scheduledDate;
            const newPlan = await MaintenancePlan.create({
                it_item_id: newLogData.itItemId,
                hostname: newLogData.hostname || null,
                category: newLogData.category || null,
                maintenance_type: newLogData.type || null,
                scheduled_date: formattedStartDate,
                scheduled_end_date: formattedEndDate,
                scheduled_start_time: newLogData.scheduledTime || null,
                scheduled_end_time: newLogData.scheduledEndTime || null,
                pic: newLogData.pic || null,
                status: 'pending',
                description: newLogData.description || newLogData.detail || null,
                plan_name: `Maintenance ${newLogData.category || 'Schedule'}`,
                created_by: createdBy
            });
            
            const savedPlan = newPlan.toJSON();
            const formatTime = (time) => time ? time.toISOString().slice(11,16) : null;
            const transformedPlan = {
                id: savedPlan.plan_id,
                itItemId: savedPlan.it_item_id,
                hostname: savedPlan.hostname,
                category: savedPlan.category,
                type: savedPlan.maintenance_type,
                scheduledDate: savedPlan.scheduled_date,
                scheduledEndDate: savedPlan.scheduled_end_date,
                scheduledStartTime: formatTime(savedPlan.scheduled_start_time),
                scheduledEndTime: formatTime(savedPlan.scheduled_end_time),
                pic: savedPlan.pic,
                status: savedPlan.status,
                detail: savedPlan.description,
                createdBy: savedPlan.created_by,
                createdAt: savedPlan.created_at,
                updatedAt: savedPlan.updated_at
            };
            
            return res.status(201).json({ 
                message: "Schedule berhasil ditambahkan", 
                data: transformedPlan 
            });
        }

        // Multi day
        const createdPlans = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const newPlan = await MaintenancePlan.create({
                it_item_id: newLogData.itItemId,
                hostname: newLogData.hostname || null,
                category: newLogData.category || null,
                maintenance_type: newLogData.type || null,
                scheduled_date: currentDate.toISOString().split("T")[0],
                scheduled_end_date: currentDate.toISOString().split("T")[0],
                scheduled_start_time: newLogData.scheduledTime || null,
                scheduled_end_time: newLogData.scheduledEndTime || null,
                pic: newLogData.pic || null,
                status: 'pending',
                description: newLogData.description || newLogData.detail || null,
                plan_name: `Maintenance ${newLogData.category || 'Schedule'} - ${currentDate.toISOString().split("T")[0]}`,
                created_by: createdBy
            });
            
            createdPlans.push(newPlan.toJSON());
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        const formatTime = (time) => time ? time.toISOString().slice(11,16) : null;
        const transformedPlans = createdPlans.map(plan => ({
            id: plan.plan_id,
            itItemId: plan.it_item_id,
            hostname: plan.hostname,
            category: plan.category,
            type: plan.maintenance_type,
            scheduledDate: plan.scheduled_date,
            scheduledEndDate: plan.scheduled_end_date,
            scheduledStartTime: formatTime(plan.scheduled_start_time),
            scheduledEndTime: formatTime(plan.scheduled_end_time),
            pic: plan.pic,
            status: plan.status,
            detail: plan.description,
            createdBy: plan.created_by,
            createdAt: plan.created_at,
            updatedAt: plan.updated_at
        }));
        
        return res.status(201).json({ 
            message: `Schedule berhasil ditambahkan untuk ${createdPlans.length} hari`, 
            data: transformedPlans 
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

        if (schedule.status !== 'pending') {
            return res.status(403).json({ message: "Hanya schedule PENDING yang boleh dihapus" });
        }

        await schedule.destroy();

        return res.status(200).json({ 
            message: "Schedule berhasil dihapus", 
            deletedId: planId 
        });
    } catch (error) {
        console.error("Gagal menghapus schedule:", error);
        res.status(500).json({ message: "Gagal menghapus schedule maintenance" });
    }
};
