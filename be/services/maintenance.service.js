import { db } from "../models/index.js";
import workorderService from "./workorder.service.js";
// ✅ FIXED: Hapus unused UserService import (no default export + dead code)

const getMaintenancePlanModel = () => {
  if (!db.MaintenancePlan) {
    throw new Error(
      "Model MaintenancePlan belum tersedia (belum diinisialisasi).",
    );
  }
  return db.MaintenancePlan;
};

const getITItemModel = () => {
  if (!db.ITItem) {
    throw new Error(
      "Model ITItem belum tersedia. Pastikan initializeDB sudah dijalankan.",
    );
  }
  return db.ITItem;
};

const lookupITItemByTag = async (tag, transaction) => {
  const normalizedTag = (tag ?? "").toString().trim();
  if (!normalizedTag) {
    return null;
  }
  const ITItem = getITItemModel();
  const target = await ITItem.findOne({
    where: db.sequelize.where(
      db.sequelize.fn(
        "LOWER",
        db.sequelize.fn(
          "LTRIM",
          db.sequelize.fn("RTRIM", db.sequelize.col("asset_tag")),
        ),
      ),
      normalizedTag.toLowerCase(),
    ),
    transaction,
  });
  return target;
};

const lookupITItemById = async (id, transaction) => {
  if (!id) return null;
  const ITItem = getITItemModel();
  return ITItem.findByPk(id, { transaction });
};

class MaintenanceService {
  /**
   * Create new schedule → auto WorkOrder + notifications
   */
  async createSchedule(payload, userInfo = {}) {
    const transaction = await db.sequelize.transaction();

    try {
      // Map frontend field names to backend field names
      const {
        itItemId,
        hostname,
        category_id,
        sub_category_id,
        asset_main_type_id,
        start_date,
        end_date,
        start_time,
        end_time,
        team,
        description,
        notes,
        picSupplier,
        priority,
        criticality,
        location,
        required_skills,
        estimated_duration,
        recurrence,
        recurrence_interval,
        recurrence_end_date,
        recurrence_count,
        // Fallback for direct backend field names
        scheduledDate,
        scheduledEndDate,
        scheduledTime,
        scheduledEndTime,
        pic,
        category,
        type,
      } = payload;

      // Normalize field names (frontend uses snake_case, backend expects camelCase in service)
      const normalizedPayload = {
        itItemId: itItemId || hostname || payload.hostname,
        scheduledDate: start_date || scheduledDate,
        scheduledEndDate: end_date || scheduledEndDate,
        scheduledTime: start_time || scheduledTime,
        scheduledEndTime: end_time || scheduledEndTime,
        categoryId: category_id,
        subCategoryId: sub_category_id,
        assetMainTypeId: asset_main_type_id,
        team: team,
        priority: priority || "medium",
        description: description || notes,
        notes: notes,
        estimatedDuration: estimated_duration || 2.0,
        location: location,
        recurrence: recurrence,
        recurrenceInterval: recurrence_interval,
        recurrenceEndDate: recurrence_end_date,
        recurrenceCount: recurrence_count,
      };

      if (!normalizedPayload.itItemId || !normalizedPayload.scheduledDate) {
        throw new Error(
          "itItemId (hostname) dan scheduledDate (start_date) wajib diisi",
        );
      }

      // Convert team array to string (comma-separated)
      let picString = null;
      if (
        Array.isArray(normalizedPayload.team) &&
        normalizedPayload.team.length > 0
      ) {
        picString = normalizedPayload.team.join(", ");
      } else if (typeof normalizedPayload.team === "string") {
        picString = normalizedPayload.team;
      } else if (pic) {
        picString = pic;
      }

      // Look up category name from ID
      let categoryName = category || null;
      if (normalizedPayload.categoryId && db.ITCategory) {
        const categoryRecord = await db.ITCategory.findByPk(
          normalizedPayload.categoryId,
          { transaction },
        );
        if (categoryRecord) {
          categoryName = categoryRecord.category_name;
        }
      }

      // Look up subcategory name from ID
      let subCategoryName = type || null;
      if (normalizedPayload.subCategoryId && db.ITSubCategory) {
        const subCategoryRecord = await db.ITSubCategory.findByPk(
          normalizedPayload.subCategoryId,
          { transaction },
        );
        if (subCategoryRecord) {
          subCategoryName = subCategoryRecord.sub_category_name;
        }
      }

      const createdBy = userInfo.name || userInfo.username || "system";

      const normalizedTag = (normalizedPayload.itItemId ?? "")
        .toString()
        .trim();
      if (!normalizedTag) {
        throw new Error("Tag asset (hostname/itItemId) wajib diisi");
      }

      const ITItem = getITItemModel();
      const targetItem = await ITItem.findOne({
        where: db.sequelize.where(
          db.sequelize.fn(
            "LOWER",
            db.sequelize.fn(
              "LTRIM",
              db.sequelize.fn("RTRIM", db.sequelize.col("asset_tag")),
            ),
          ),
          normalizedTag.toLowerCase(),
        ),
        transaction,
      });

      let itItemGuid = null;
      let assetId = null;

      if (!targetItem) {
        console.warn(
          `[WARNING] Asset dengan tag ${normalizedTag} tidak ditemukan. Using placeholder UUID.`,
        );
        // Use a placeholder UUID (nil UUID) when asset not found
        itItemGuid = "00000000-0000-0000-0000-000000000000";
      } else {
        itItemGuid = targetItem.it_item_id;
        assetId = targetItem.asset_id;
      }

      const startDate = new Date(normalizedPayload.scheduledDate + "T00:00:00");
      const endDate = normalizedPayload.scheduledEndDate
        ? new Date(normalizedPayload.scheduledEndDate + "T00:00:00")
        : startDate;
      const createdPlans = [];

      // Handle recurrence - create multiple schedules if needed
      let dates = [];
      if (
        normalizedPayload.recurrence &&
        normalizedPayload.recurrence !== "none"
      ) {
        const interval = parseInt(normalizedPayload.recurrenceInterval) || 1;
        const maxCount = parseInt(normalizedPayload.recurrenceCount) || 100;
        const recurrenceEnd = normalizedPayload.recurrenceEndDate
          ? new Date(normalizedPayload.recurrenceEndDate)
          : null;

        let current = new Date(startDate);
        let count = 0;
        while (count < maxCount && current <= endDate) {
          if (recurrenceEnd && current > recurrenceEnd) break;
          dates.push(new Date(current));
          count++;

          // Add interval based on recurrence type
          switch (normalizedPayload.recurrence) {
            case "daily":
              current.setDate(current.getDate() + interval);
              break;
            case "weekly":
              current.setDate(current.getDate() + interval * 7);
              break;
            case "monthly":
              current.setMonth(current.getMonth() + interval);
              break;
            case "yearly":
              current.setFullYear(current.getFullYear() + interval);
              break;
            default:
              current.setDate(current.getDate() + 1);
          }
        }
      } else {
        // No recurrence - just use start to end date range
        let current = new Date(startDate);
        while (current <= endDate) {
          dates.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
      }

      const MaintenancePlan = getMaintenancePlanModel();

      for (const planDate of dates) {
        const planDateStr = planDate.toISOString().split("T")[0];
        const plan = await MaintenancePlan.create(
          {
            it_item_id: itItemGuid,
            hostname: normalizedPayload.itItemId,
            category: categoryName,
            maintenance_type: subCategoryName,
            scheduled_date: planDateStr,
            scheduled_end_date: planDateStr,
            scheduled_start_time: normalizedPayload.scheduledTime || null,
            scheduled_end_time: normalizedPayload.scheduledEndTime || null,
            pic: picString,
            status: "pending",
            description: normalizedPayload.description,
            notes: normalizedPayload.notes,
            plan_name: `PM Schedule - ${normalizedPayload.itItemId} (${planDateStr})`,
            created_by: createdBy,
            priority: normalizedPayload.priority || "medium",
            criticality: criticality || "medium",
            location: normalizedPayload.location || null,
            required_skills: Array.isArray(required_skills)
              ? required_skills
              : [],
            estimated_duration: normalizedPayload.estimatedDuration || 2.0,
          },
          { transaction },
        );

        const planData = plan.toJSON();
        await workorderService.createWorkOrderFromSchedule(
          plan.plan_id,
          picString,
          planData,
          { transaction, assetId },
        );

        createdPlans.push(this.transformPlan(planData));
      }

      await transaction.commit();

      return {
        success: true,
        message: `Schedule created untuk ${createdPlans.length} hari + WorkOrder auto-generated`,
        data: createdPlans,
      };
    } catch (error) {
      await transaction.rollback();
      console.error("MaintenanceService.createSchedule failed:", error);
      return {
        success: false,
        message: error.message || "Failed to create schedule",
      };
    }
  }

  async updateSchedule(planId, payload) {
    const transaction = await db.sequelize.transaction();

    try {
      const MaintenancePlan = getMaintenancePlanModel();
      const plan = await MaintenancePlan.findByPk(planId, { transaction });
      if (!plan) {
        throw new Error("MaintenancePlan not found");
      }

      let resolvedItItemGuid = plan.it_item_id;
      let resolvedAssetId = null;
      if (payload.itItemId && payload.itItemId !== plan.it_item_id) {
        const targetItem = await lookupITItemByTag(
          payload.itItemId,
          transaction,
        );
        if (!targetItem)
          throw new Error(`Asset ${payload.itItemId} tidak ditemukan`);
        resolvedItItemGuid = targetItem.it_item_id;
        resolvedAssetId = targetItem.asset_id;
      }

      const oldPic = plan.pic;
      const newPic = payload.pic || plan.pic;

      const updateData = {
        it_item_id: resolvedItItemGuid,
        hostname: payload.hostname || plan.hostname,
        category: payload.category || plan.category,
        maintenance_type: payload.type || plan.maintenance_type,
        scheduled_date: payload.scheduledDate || plan.scheduled_date,
        scheduled_end_date: payload.scheduledEndDate || plan.scheduled_end_date,
        scheduled_start_time:
          payload.scheduledTime || plan.scheduled_start_time,
        scheduled_end_time: payload.scheduledEndTime || plan.scheduled_end_time,
        pic: newPic,
        description: payload.description || payload.detail || plan.description,
        notes: payload.notes || plan.notes,
        status: payload.status || plan.status,
        updated_at: db.sequelize.literal("GETDATE()"),
      };

      await plan.update(updateData, { transaction });

      if (oldPic !== newPic && newPic) {
        await workorderService.deleteWorkOrdersByPlan(planId, { transaction });
        const updatedPlanData = plan.toJSON();
        const assetIdForWO =
          resolvedAssetId ??
          (await lookupITItemById(resolvedItItemGuid, transaction))?.asset_id;
        await workorderService.createWorkOrderFromSchedule(
          planId,
          newPic,
          updatedPlanData,
          { transaction, assetId: assetIdForWO },
        );
      }

      await transaction.commit();

      const updatedPlan = await MaintenancePlan.findByPk(planId);
      return {
        success: true,
        message:
          "Schedule updated" +
          (oldPic !== newPic ? " + WorkOrder recreated" : ""),
        data: this.transformPlan(updatedPlan.toJSON()),
      };
    } catch (error) {
      await transaction.rollback();
      console.error("MaintenanceService.updateSchedule failed:", error);
      return {
        success: false,
        message: error.message || "Failed to update schedule",
      };
    }
  }

  /**
   * Transform plan data for frontend response
   */
  transformPlan(planData) {
    return {
      id: planData.plan_id,
      itItemId: planData.it_item_id,
      hostname: planData.hostname,
      planName: planData.plan_name,
      category: planData.category,
      maintenanceType: planData.maintenance_type,
      scheduledDate: planData.scheduled_date,
      scheduledEndDate: planData.scheduled_end_date,
      scheduledStartTime: planData.scheduled_start_time,
      scheduledEndTime: planData.scheduled_end_time,
      pic: planData.pic,
      status: planData.status,
      description: planData.description,
      notes: planData.notes,
      createdBy: planData.created_by,
      priority: planData.priority,
      criticality: planData.criticality,
      location: planData.location,
      requiredSkills: planData.required_skills,
      estimatedDuration: planData.estimated_duration,
    };
  }

  /**
   * CASCADE DELETE: MaintenancePlan + WorkOrders + Assignments
   * Hanya untuk status 'pending'
   */
  async deleteSchedule(planId, userInfo = {}) {
    const transaction = await db.sequelize.transaction();

    try {
      const MaintenancePlan = getMaintenancePlanModel();
      const plan = await MaintenancePlan.findByPk(planId, { transaction });

      if (!plan) {
        throw new Error("Maintenance plan tidak ditemukan");
      }

      if (plan.status !== "pending") {
        throw new Error("Hanya schedule PENDING yang boleh dihapus");
      }

      // 1. Hapus related WorkOrders + Assignments
      const deletedWO = await workorderService.deleteWorkOrdersByPlan(planId, {
        transaction,
      });

      // 2. Hapus MaintenancePlan
      await plan.destroy({ transaction });

      await transaction.commit();

      return {
        success: true,
        message: `Schedule + ${deletedWO.deletedCount || 0} WorkOrder berhasil dihapus`,
        deletedPlanId: planId,
        deletedWorkOrderCount: deletedWO.deletedCount || 0,
      };
    } catch (error) {
      await transaction.rollback();
      console.error("MaintenanceService.deleteSchedule failed:", error);
      return {
        success: false,
        message: error.message || "Gagal menghapus schedule",
      };
    }
  }
}

export default new MaintenanceService();
