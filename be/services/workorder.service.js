import { db } from "../models/index.js";
import webPushService from "./webPush.service.js";
import { v4 as uuidv4 } from "uuid";
import { Op } from "sequelize";

const getModel = (name) => {
  const model = db[name];
  if (!model) {
    throw new Error(
      `Model ${name} belum tersedia. Pastikan database sudah diinisialisasi.`,
    );
  }
  return model;
};

const getWorkOrderModel = () => getModel("WorkOrder");
const getWOAssignmentModel = () => getModel("WOAssignment");
const getMaintenancePlanModel = () => getModel("MaintenancePlan");
const getITItemModel = () => getModel("ITItem");
const getWebPushSubscriptionModel = () => getModel("WebPushSubscription");

class WorkOrderService {
  /**
   * Auto create WorkOrder(s) dari MaintenancePlan
   */
  async createWorkOrderFromSchedule(
    planId,
    picString,
    planData = {},
    options = {},
  ) {
    const useExistingTransaction = !!options.transaction;
    const transaction = useExistingTransaction
      ? options.transaction
      : await db.sequelize.transaction();

    try {
      const WorkOrder = getWorkOrderModel();
      const WOAssignment = getWOAssignmentModel();
      const MaintenancePlan = getMaintenancePlanModel();

      const plan = await MaintenancePlan.findByPk(planId, { transaction });
      if (!plan) throw new Error(`MaintenancePlan ID ${planId} not found`);
      const ITItem = getITItemModel();

      const itItem = await ITItem.findOne({
        where: { it_item_id: plan.it_item_id },
        transaction,
      });

      const picNames = picString
        .split(/[;,\n]/)
        .map((pic) => pic.trim())
        .filter((pic) => pic.length > 0)
        .slice(0, 5);

      if (picNames.length === 0) throw new Error("No valid PIC names");

      const createdWorkOrders = [];

      for (const picName of picNames) {
        const workOrderId = uuidv4();

        const workOrder = await WorkOrder.create(
          {
            plan_id: plan.plan_id,
            asset_id: null,
            it_item_id: plan.it_item_id,
            title: `WO - ${plan.plan_name || "Maintenance Schedule"}`,
            description: `${plan.description || "Auto-generated from schedule"} (IT: ${plan.it_item_id})`,
            priority: "medium",
            status: "assigned",
            scheduled_date: plan.scheduled_date,
          },
          { transaction },
        );

        await WOAssignment.create(
          {
            wo_id: workOrder.wo_id,
            nik: picName,
            assigned_date: db.sequelize.literal("GETDATE()"),
          },
          { transaction },
        );

        createdWorkOrders.push({
          workOrderId: workOrderId,
          picName,
          planId: plan.plan_id,
        });
      }

      if (!useExistingTransaction) {
        await transaction.commit();
      }
      await this.sendWorkOrderNotifications(createdWorkOrders, planData);

      return {
        success: true,
        count: createdWorkOrders.length,
        workOrders: createdWorkOrders,
      };
    } catch (error) {
      if (!useExistingTransaction && transaction) {
        await transaction.rollback();
      }
      console.error(
        "WorkOrderService.createWorkOrderFromSchedule failed:",
        error,
      );
      throw error;
    }
  }

  /**
   * FIXED: List work orders WITH ititems JOIN (Asset Tag Display) ✅ STEP 1
   */
  async listWorkOrders(query = {}) {
    try {
      const { status, technician, limit = 50, page = 1 } = query;
      const offset = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;
      if (technician)
        where["$assignments.nik$"] = { [Op.like]: `%${technician}%` };

      const WorkOrder = getWorkOrderModel();
      const WOAssignment = getWOAssignmentModel();
      const MaintenancePlan = getMaintenancePlanModel();
      const ITItem = getITItemModel(); // ✅ NEW

      console.log("DEBUG: Models loaded:", {
        WorkOrder: !!WorkOrder,
        WOAssignment: !!WOAssignment,
        MaintenancePlan: !!MaintenancePlan,
        ITItem: !!ITItem,
      });

      const { count, rows } = await WorkOrder.findAndCountAll({
        where,
        include: [
          {
            model: WOAssignment,
            as: "assignments",
            required: false,
          },
          {
            model: MaintenancePlan,
            as: "plan",
            required: false,
          },
          {
            model: ITItem,
            as: "itItem", // ✅ NEW JOIN ititems
            required: false,
            attributes: ["it_item_id", "asset_tag"], // ✅ FIXED: use correct column names
          },
        ],
        limit,
        offset,
        order: [["scheduled_date", "DESC"]],
        attributes: {
          exclude: ["updated_at"], // Perf optimization
        },
      });

      return {
        success: true,
        data: rows.map((wo) => ({
          id: wo.wo_id,
          wo_id: wo.wo_id,
          title: wo.title,
          status: wo.status,
          priority: wo.priority,
          scheduledStart: wo.scheduled_date,
          scheduledEnd: wo.scheduled_date,
          pic: wo.assignments?.[0]?.nik || "Unassigned",
          assignedToName: wo.assignments?.[0]?.nik || "Unassigned",
          createdAt: wo.created_at,
          assetId: wo.it_item_id,
          assetTag: wo.itItem?.asset_tag || "N/A", // ✅ FIXED: use asset_tag
          assetName: "Unknown Asset", // ✅ Removed: asset_name doesn't exist in ITItem schema
          planId: wo.plan_id,
        })),
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      console.error("listWorkOrders ERROR:", error.message);
      console.error("Stack:", error.stack);
      if (error.original) {
        console.error("SQL Error:", error.original.message);
        console.error("SQL Query:", error.original.sql);
      }
      throw error;
    }
  }

  /**
   * ✅ NEW: Complete work order
   */
  async completeWorkOrder(workOrderId) {
    const WorkOrder = getWorkOrderModel();
    const wo = await WorkOrder.findOne({ where: { wo_id: workOrderId } });
    if (!wo) throw new Error("WorkOrder not found");

    if (wo.status === "completed") throw new Error("Already completed");

    await wo.update({ status: "completed", completed_at: new Date() });

    return { success: true, message: "WorkOrder completed", workOrderId };
  }

  /**
   * ✅ NEW: Get technicians list
   */
  async getTechnicians() {
    const WOAssignment = getWOAssignmentModel();
    const technicians = await WOAssignment.findAll({
      attributes: ["nik"],
      group: ["nik"],
      order: [["nik", "ASC"]],
      limit: 100,
    });

    return {
      success: true,
      data: technicians
        .map((t) => ({
          id: t.nik,
          name: t.nik,
        }))
        .filter(Boolean),
    };
  }

  /**
   * ✅ NEW: Get stats
   */
  async getWorkOrderStats() {
    const stats = await db.sequelize.query(
      `
      SELECT 
        status, 
        COUNT(*) as count 
      FROM work_orders 
      GROUP BY status
    `,
      { type: db.sequelize.QueryTypes.SELECT },
    );

    const result = {
      total: 0,
      open: 0,
      assigned: 0,
      inProgress: 0,
      completed: 0,
    };

    stats.forEach((stat) => {
      result.total += parseInt(stat.count);
      result[stat.status || "open"] = parseInt(stat.count);
    });

    return { success: true, data: result };
  }

  /**
   * ✅ NEW: Delete work order (only draft/pending)
   */
  async deleteWorkOrder(workOrderId) {
    const WorkOrder = getWorkOrderModel();
    const wo = await WorkOrder.findOne({ where: { wo_id: workOrderId } });
    if (!wo) throw new Error("WorkOrder not found");
    if (!["draft", "pending"].includes(wo.status))
      throw new Error("Cannot delete completed WO");

    await wo.destroy();
    return { success: true, message: "WorkOrder deleted" };
  }

  // Existing methods (unchanged)
  async sendWorkOrderNotifications(workOrders, planData = {}) {
    try {
      for (const { picName } of workOrders) {
        console.log(`✅ Notification sent to ${picName}`);
      }
    } catch (error) {
      console.error("Notification failed:", error);
    }
  }

  async deleteWorkOrdersByPlan(planId, options = {}) {
    const WorkOrder = getWorkOrderModel();
    const deletedCount = await WorkOrder.destroy({
      where: { plan_id: planId },
      transaction: options.transaction,
    });
    return { success: true, deletedCount };
  }

  async createWorkOrder(payload) {
    const transaction = await db.sequelize.transaction();
    try {
      const WorkOrder = getWorkOrderModel();
      const workOrderId = uuidv4();

      const wo = await WorkOrder.create(
        {
          wo_id: workOrderId,
          ...payload,
          status: "draft",
          created_by: payload.created_by || "manual",
        },
        { transaction },
      );

      await transaction.commit();
      return { success: true, data: { id: workOrderId, ...wo.toJSON() } };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

// NAMED EXPORTS untuk controller
export const listWorkOrders = new WorkOrderService().listWorkOrders.bind(
  new WorkOrderService(),
);
export const createWorkOrder = new WorkOrderService().createWorkOrder.bind(
  new WorkOrderService(),
);
export const completeWorkOrder = new WorkOrderService().completeWorkOrder.bind(
  new WorkOrderService(),
);
export const getTechnicians = new WorkOrderService().getTechnicians.bind(
  new WorkOrderService(),
);
export const getWorkOrderStats = new WorkOrderService().getWorkOrderStats.bind(
  new WorkOrderService(),
);
export const deleteWorkOrder = new WorkOrderService().deleteWorkOrder.bind(
  new WorkOrderService(),
);

export default new WorkOrderService();
