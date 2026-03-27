import { db } from '../models/index.js';
import workorderService from './workorder.service.js';
// ✅ FIXED: Hapus unused UserService import (no default export + dead code)

const getMaintenancePlanModel = () => {
  if (!db.MaintenancePlan) {
    throw new Error("Model MaintenancePlan belum tersedia (belum diinisialisasi).");
  }
  return db.MaintenancePlan;
};

const getITItemModel = () => {
  if (!db.ITItem) {
    throw new Error("Model ITItem belum tersedia. Pastikan initializeDB sudah dijalankan.");
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
      db.sequelize.fn('LOWER', db.sequelize.fn('LTRIM', db.sequelize.fn('RTRIM', db.sequelize.col('asset_tag')))),
      normalizedTag.toLowerCase()
    ),
    transaction
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
      const {
        itItemId, hostname, category, type, scheduledDate, scheduledTime,
        scheduledEndDate, scheduledEndTime, pic, description, notes,
        picSupplier
      } = payload;

      if (!itItemId || !scheduledDate) {
        throw new Error('itItemId dan scheduledDate wajib');
      }

      const createdBy = userInfo.name || userInfo.username || 'system';
      
      const normalizedTag = (itItemId ?? "").toString().trim();
      if (!normalizedTag) {
        throw new Error("Tag asset (itItemId) wajib diisi");
      }

      const ITItem = getITItemModel();
      const targetItem = await ITItem.findOne({
        where: db.sequelize.where(
          db.sequelize.fn('LOWER', db.sequelize.fn('LTRIM', db.sequelize.fn('RTRIM', db.sequelize.col('asset_tag')))),
          normalizedTag.toLowerCase()
        ),
        transaction
      });
      if (!targetItem) {
        throw new Error(`Asset dengan tag ${normalizedTag} tidak ditemukan`);
      }
      const itItemGuid = targetItem.it_item_id;
      const assetId = targetItem.asset_id;

      const startDate = new Date(scheduledDate + 'T00:00:00');
      const endDate = scheduledEndDate ? new Date(scheduledEndDate + 'T00:00:00') : startDate;
      const createdPlans = [];

      const MaintenancePlan = getMaintenancePlanModel();
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const planDate = currentDate.toISOString().split('T')[0];
        const plan = await MaintenancePlan.create({
          it_item_id: itItemGuid,
          hostname,
          category,
          maintenance_type: type,
          scheduled_date: planDate,
          scheduled_end_date: planDate,
          scheduled_start_time: scheduledTime || null,
          scheduled_end_time: scheduledEndTime || null,
          pic,
          status: 'pending',
          description,
          notes,
          plan_name: `PM Schedule - ${hostname || itItemId} (${planDate})`,
          created_by: createdBy
        }, { transaction });

        const planData = plan.toJSON();
        await workorderService.createWorkOrderFromSchedule(plan.plan_id, pic, planData, { transaction, assetId });

        createdPlans.push(this.transformPlan(planData));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      await transaction.commit();

      return {
        success: true,
        message: `Schedule created untuk ${createdPlans.length} hari + WorkOrder auto-generated`,
        data: createdPlans
      };

    } catch (error) {
      await transaction.rollback();
      console.error('MaintenanceService.createSchedule failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to create schedule'
      };
    }
  }

  async updateSchedule(planId, payload) {
    const transaction = await db.sequelize.transaction();
    
    try {
      const MaintenancePlan = getMaintenancePlanModel();
      const plan = await MaintenancePlan.findByPk(planId, { transaction });
      if (!plan) {
        throw new Error('MaintenancePlan not found');
      }

      let resolvedItItemGuid = plan.it_item_id;
      let resolvedAssetId = null;
      if (payload.itItemId && payload.itItemId !== plan.it_item_id) {
        const targetItem = await lookupITItemByTag(payload.itItemId, transaction);
        if (!targetItem) throw new Error(`Asset ${payload.itItemId} tidak ditemukan`);
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
        scheduled_start_time: payload.scheduledTime || plan.scheduled_start_time,
        scheduled_end_time: payload.scheduledEndTime || plan.scheduled_end_time,
        pic: newPic,
        description: payload.description || payload.detail || plan.description,
        notes: payload.notes || plan.notes,
        status: payload.status || plan.status,
        updated_at: db.sequelize.literal('GETDATE()')
      };

      await plan.update(updateData, { transaction });

      if (oldPic !== newPic && newPic) {
        await workorderService.deleteWorkOrdersByPlan(planId, { transaction });
        const updatedPlanData = plan.toJSON();
        const assetIdForWO = resolvedAssetId ?? (await lookupITItemById(resolvedItItemGuid, transaction))?.asset_id;
        await workorderService.createWorkOrderFromSchedule(planId, newPic, updatedPlanData, { transaction, assetId: assetIdForWO });
      }

      await transaction.commit();

      const updatedPlan = await MaintenancePlan.findByPk(planId);
      return {
        success: true,
        message: 'Schedule updated' + (oldPic !== newPic ? ' + WorkOrder recreated' : ''),
        data: this.transformPlan(updatedPlan.toJSON())
      };

    } catch (error) {
      await transaction.rollback();
      console.error('MaintenanceService.updateSchedule failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to update schedule'
      };
    }
  }

transformPlan(plan) {
    const formatTime = (time) => time ? new Date(time).toISOString().slice(11, 16) : null;
    
    return {
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
      notes: plan.notes,
      planName: plan.plan_name,
      createdBy: plan.created_by,
      createdAt: plan.created_at,
      updatedAt: plan.updated_at
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
        throw new Error('Maintenance plan tidak ditemukan');
      }
      
      if (plan.status !== 'pending') {
        throw new Error('Hanya schedule PENDING yang boleh dihapus');
      }

      // 1. Hapus related WorkOrders + Assignments  
      const deletedWO = await workorderService.deleteWorkOrdersByPlan(planId, { transaction });
      
      // 2. Hapus MaintenancePlan
      await plan.destroy({ transaction });

      await transaction.commit();

      return {
        success: true,
        message: `Schedule + ${deletedWO.deletedCount || 0} WorkOrder berhasil dihapus`,
        deletedPlanId: planId,
        deletedWorkOrderCount: deletedWO.deletedCount || 0
      };

    } catch (error) {
      await transaction.rollback();
      console.error('MaintenanceService.deleteSchedule failed:', error);
      return {
        success: false,
        message: error.message || 'Gagal menghapus schedule'
      };
    }
  }
}

export default new MaintenanceService();

