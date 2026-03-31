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

const getMaintenancePlanAssetModel = () => {
  if (!db.MaintenancePlanAsset) {
    throw new Error(
      "Model MaintenancePlanAsset belum tersedia (belum diinisialisasi).",
    );
  }
  return db.MaintenancePlanAsset;
};

const normalizeAssetRow = (raw) => {
  if (!raw) return null;
  const source = typeof raw === "string" ? { hostname: raw } : raw;
  const hostname =
    (source.hostname ||
      source.asset_tag ||
      source.assetTag ||
      source.host ||
      source.assetTagName ||
      source.asset_name)
      ?.toString()
      .trim();
  const assetTag =
    (source.asset_tag || source.assetTag || source.assetTagName)
      ?.toString()
      .trim();
  const itItemId =
    source.it_item_id ||
    source.itItemId ||
    source.itItemID ||
    source.id ||
    source.uuid ||
    source.asset_id;

  if (!hostname && !assetTag && !itItemId) return null;

  return {
    itItemId: itItemId ? itItemId.toString() : undefined,
    hostname: hostname || assetTag,
    assetTag: assetTag || hostname,
  };
};

const resolveAssetSelection = (payload) => {
  const rawSelection =
    payload.selected_assets ||
    payload.assets ||
    payload.assetList ||
    payload.asset_list;

  const normalized = [];
  if (Array.isArray(rawSelection) && rawSelection.length > 0) {
    normalized.push(
      ...rawSelection.map(normalizeAssetRow).filter((row) => row),
    );
  } else if (rawSelection) {
    const single = normalizeAssetRow(rawSelection);
    if (single) normalized.push(single);
  }

  if (normalized.length === 0 && payload.hostname) {
    const fallbackValues = Array.isArray(payload.hostname)
      ? payload.hostname
      : [payload.hostname];
    fallbackValues.forEach((value) => {
      const row = normalizeAssetRow(value);
      if (row) normalized.push(row);
    });
  }

  return normalized;
};

const shouldSyncAssetsFromPayload = (payload) =>
  Boolean(
    payload.selected_assets ||
      payload.assets ||
      payload.assetList ||
      payload.asset_list,
  );

const createPlanAssetRecords = (planId, assets = []) => {
  return assets
    .map((asset) => ({
      plan_id: planId,
      it_item_id: asset.itItemId || null,
      hostname: asset.hostname || null,
      asset_tag: asset.assetTag || null,
      created_at: db.sequelize.literal("GETDATE()"),
      updated_at: db.sequelize.literal("GETDATE()"),
    }))
    .filter(
      (record) =>
        Boolean(record.hostname) ||
        Boolean(record.asset_tag) ||
        Boolean(record.it_item_id),
    );
};

const persistPlanAssets = async (planId, assets, transaction) => {
  if (!assets || assets.length === 0) return [];
  const MaintenancePlanAsset = getMaintenancePlanAssetModel();
  const records = createPlanAssetRecords(planId, assets);
  if (records.length === 0) return [];
  await MaintenancePlanAsset.bulkCreate(records, { transaction });
  return records;
};

const replacePlanAssets = async (planId, assets, transaction) => {
  const MaintenancePlanAsset = getMaintenancePlanAssetModel();
  await MaintenancePlanAsset.destroy({
    where: { plan_id: planId },
    transaction,
  });
  return persistPlanAssets(planId, assets, transaction);
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
      const normalizedAssets = resolveAssetSelection(payload);

      const normalizedPayload = {
        itItemId: itItemId || hostname || payload.hostname,
        hostname: Array.isArray(hostname) ? hostname[0] : hostname,
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
        assets: normalizedAssets,
      };

      if (
        (!normalizedPayload.assets || normalizedPayload.assets.length === 0) &&
        (normalizedPayload.hostname || normalizedPayload.itItemId)
      ) {
        const fallback =
          normalizedPayload.hostname || normalizedPayload.itItemId;
        normalizedPayload.assets = [
          {
            itItemId: normalizedPayload.itItemId,
            hostname: fallback,
            assetTag: fallback,
          },
        ];
      }

      if (normalizedPayload.assets && normalizedPayload.assets.length > 0) {
        const primaryAsset = normalizedPayload.assets[0];
        normalizedPayload.itItemId =
          normalizedPayload.itItemId ||
          primaryAsset.itItemId ||
          primaryAsset.hostname;
        normalizedPayload.hostname =
          normalizedPayload.hostname ||
          primaryAsset.hostname ||
          primaryAsset.assetTag ||
          normalizedPayload.itItemId;
      }

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
        assetId = targetItem.it_item_id;
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

      const formatDateForStorage = (date) => {
        const localDate = new Date(date);
        const year = localDate.getFullYear();
        const month = String(localDate.getMonth() + 1).padStart(2, "0");
        const day = String(localDate.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      for (const planDate of dates) {
        const planDateStr = formatDateForStorage(planDate);
        const assetLabel =
          normalizedPayload.hostname || normalizedPayload.itItemId;
        const plan = await MaintenancePlan.create(
          {
            it_item_id: itItemGuid,
            hostname: assetLabel,
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
            plan_name: `PM Schedule - ${assetLabel} (${planDateStr})`,
            created_by: createdBy,
            priority: normalizedPayload.priority || "medium",
            criticality: criticality || "medium",
            location: normalizedPayload.location || null,
            required_skills: Array.isArray(required_skills)
              ? required_skills
              : [],
            estimated_duration: normalizedPayload.estimatedDuration || 2.0,
            asset_main_type_id: normalizedPayload.assetMainTypeId || null,
            category_id: normalizedPayload.categoryId || null,
            sub_category_id: normalizedPayload.subCategoryId || null,
            recurrence: normalizedPayload.recurrence || null,
            recurrence_interval: normalizedPayload.recurrenceInterval || null,
            recurrence_count: normalizedPayload.recurrenceCount || null,
            recurrence_end_date: normalizedPayload.recurrenceEndDate || null,
          },
          { transaction },
        );

        const planData = plan.toJSON();
        const planAssets = await persistPlanAssets(
          plan.plan_id,
          normalizedPayload.assets,
          transaction,
        );
        planData.assets = planAssets;

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
    if (transaction && !transaction.finished) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        if (rollbackError?.parent?.number === 3903) {
          console.warn(
            "Rollback already executed elsewhere; ignoring duplicate ROLLBACK.",
          );
        } else {
          throw rollbackError;
        }
      }
    }
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
      const normalizedAssets = resolveAssetSelection(payload);
      const syncAssets = shouldSyncAssetsFromPayload(payload);
      const primaryAsset =
        syncAssets && normalizedAssets.length > 0
          ? normalizedAssets[0]
          : null;
      if (primaryAsset) {
        payload.itItemId =
          payload.itItemId ||
          primaryAsset.itItemId ||
          primaryAsset.hostname ||
          primaryAsset.assetTag;
        payload.hostname =
          payload.hostname ||
          primaryAsset.hostname ||
          primaryAsset.assetTag;
      }

      const MaintenancePlan = getMaintenancePlanModel();
      const plan = await MaintenancePlan.findByPk(planId, { transaction });
      if (!plan) {
        throw new Error("MaintenancePlan not found");
      }

      let resolvedItItemGuid = plan.it_item_id;
      let resolvedAssetId = null;
      if (payload.itItemId && payload.itItemId !== plan.it_item_id) {
        let targetItem =
          (await lookupITItemById(payload.itItemId, transaction)) ||
          (await lookupITItemByTag(payload.itItemId, transaction));
        if (!targetItem)
          throw new Error(`Asset ${payload.itItemId} tidak ditemukan`);
        resolvedItItemGuid = targetItem.it_item_id;
        resolvedAssetId = targetItem.it_item_id;
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
        asset_main_type_id:
          payload.assetMainTypeId ??
          payload.asset_main_type_id ??
          plan.asset_main_type_id,
        category_id:
          payload.categoryId || payload.category_id || plan.category_id,
        sub_category_id:
          payload.subCategoryId || payload.sub_category_id || plan.sub_category_id,
        recurrence: payload.recurrence ?? plan.recurrence,
        recurrence_interval:
          payload.recurrenceInterval ?? payload.recurrence_interval ?? plan.recurrence_interval,
        recurrence_count:
          payload.recurrenceCount ?? payload.recurrence_count ?? plan.recurrence_count,
        recurrence_end_date:
          payload.recurrenceEndDate ??
          payload.recurrence_end_date ??
          plan.recurrence_end_date,
        updated_at: db.sequelize.literal("GETDATE()"),
      };

      await plan.update(updateData, { transaction });

      if (syncAssets) {
        await replacePlanAssets(planId, normalizedAssets, transaction);
      }

      if (oldPic !== newPic && newPic) {
        await workorderService.deleteWorkOrdersByPlan(planId, { transaction });
        const updatedPlanData = plan.toJSON();
        const assetIdForWO =
          resolvedAssetId ??
          (await lookupITItemById(resolvedItItemGuid, transaction))?.it_item_id;
        await workorderService.createWorkOrderFromSchedule(
          planId,
          newPic,
          updatedPlanData,
          { transaction, assetId: assetIdForWO },
        );
      }

      await transaction.commit();

      const updatedPlan = await MaintenancePlan.findByPk(planId, {
        include: [
          {
            model: getMaintenancePlanAssetModel(),
            as: "assets",
          },
        ],
      });
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
      assetMainTypeId: planData.asset_main_type_id,
      categoryId: planData.category_id,
      subCategoryId: planData.sub_category_id,
      recurrence: planData.recurrence,
      recurrenceInterval: planData.recurrence_interval,
      recurrenceCount: planData.recurrence_count,
      recurrenceEndDate: planData.recurrence_end_date,
      assets: (planData.assets || []).map((asset) => ({
        id: asset.id,
        itItemId: asset.it_item_id,
        hostname: asset.hostname,
        assetTag: asset.asset_tag,
      })),
      scheduleRule: planData.schedule_rule,
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
