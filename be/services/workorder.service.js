// be/services/workorder.service.js - ESM Production Ready
import { Op } from 'sequelize';
import { sequelize, db as models } from '../models/index.js';

/**
 * List work orders dengan filter, search, pagination
 */
export const listWorkOrders = async (query = {}) => {
  console.log('🔍 listWorkOrders query:', JSON.stringify(query, null, 2));
  try {
    const {
      dateRange,
      status,
      priority,
      technician,
      search,
      page = 1,
      limit = 50,
      orderBy = 'created_at',
      orderDir = 'DESC'
    } = query;

    const offset = (page - 1) * limit;
    const where = {}; 

    if (status && status !== 'all') where.status = status;
    if (priority && priority !== 'all') where.priority = priority;
    if (technician && technician !== 'all') {
      where['assigned_to_nik'] = technician;
    }

    if (dateRange && dateRange !== 'all') {
      const match = dateRange.match(/^(\d+)([dhmy])$/i);
      if (match) {
        const [, num, unit] = match;
        const value = parseInt(num);
        if (!isNaN(value) && value > 0) {
          const intervalMap = { 
            'd': 'day', 'h': 'hour', 'm': 'month', 'y': 'year' 
          };
          const intervalType = intervalMap[unit.toLowerCase()] || 'day';
          
          // ✅ MSSQL native DATEADD - fix timezone bug
          where.created_at = {
            [Op.gte]: sequelize.literal(`DATEADD(${intervalType}, -${value}, GETUTCDATE())`)
          };
          
          console.log(`✅ Date filter: ${value}${unit.toLowerCase()} → MSSQL DATEADD(${intervalType}, -${value}, GETUTCDATE())`);
        }
      } else {
        console.warn(`⚠️ Invalid dateRange: ${dateRange}`);
      }
    }

    if (search) {
      where[Op.or] = [
        { wo_id: { [Op.like]: `%${search}%` } },
        { title: { [Op.like]: `%${search}%` } },
        sequelize.where(sequelize.col('asset_id'), { [Op.like]: `%${search}%` })
      ];
    }

    console.log('📊 Sequelize where:', JSON.stringify(where, null, 2));
    
    // 🛡️ MSSQL date literal error handling
    let result;
    try {
      result = await models.WorkOrder.findAndCountAll({
        where,
        order: [[orderBy, orderDir]],
        limit,
        offset,
        distinct: true,
      attributes: [
        ['wo_id', 'id'], 'title', 'description', ['asset_id', 'assetId'],
        'status', 'priority', ['assigned_to_nik', 'assignedToNik'],
        'category', 'scheduled_date', 'completed_at',
        ['created_at', 'createdAt'], ['updated_at', 'updatedAt']
      ]
    });
  } catch (dbError) {
      console.error('💥 MSSQL Date Error → Fallback:', dbError.message);
      const fallbackWhere = { ...where };
      delete fallbackWhere.created_at;
      result = await models.WorkOrder.findAndCountAll({
        where: fallbackWhere,
        order: [[orderBy, orderDir]],
        limit,
        offset,
        distinct: true,
        attributes: [
          ['wo_id', 'id'], 'title', 'description', ['asset_id', 'assetId'], 
          'status', 'priority', ['assigned_to_nik', 'assignedToNik'], 
          'category', 'scheduled_date', 'completed_at', 
          ['created_at', 'createdAt'], ['updated_at', 'updatedAt']
        ]
    });
  }

    const { count, rows } = result;

    return {
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    console.error('💥 listWorkOrders ERROR:', error);
    console.error('💥 Stack:', error.stack);
    throw error;
  }
};

export const getTechnicians = async () => ({
  success: true,
  data: []
});

export const getWorkOrderStats = async () => {
  const [total, open, inProgress, completed] = await Promise.all([
    models.WorkOrder.count(),
    models.WorkOrder.count({ where: { status: 'open' } }),
    models.WorkOrder.count({ where: { status: 'in_progress' } }),
    models.WorkOrder.count({ where: { status: 'completed' } })
  ]);

  return {
    success: true,
    data: { total, open, inProgress, completed }
  };
};

export const createWorkOrder = async (data) => {
  const workOrder = await models.WorkOrder.create({
    ...data,
    status: 'open',
    priority: data.priority || 'medium'
  });

  return {
    success: true,
    message: 'Work order created successfully',
    data: workOrder
  };
};

export const completeWorkOrder = async (woId) => {
  const [updatedCount] = await models.WorkOrder.update(
    { status: 'completed', completed_at: new Date() },
    { where: { wo_id: woId } }  // Fix: wo_id bukan id
  );

  if (updatedCount === 0) throw new Error('Work order not found');

  return { success: true, message: 'Work order completed' };
};

export const deleteWorkOrder = async (woId) => {
  const deletedCount = await models.WorkOrder.destroy({ where: { wo_id: woId } });

  if (deletedCount === 0) throw new Error('Work order not found');

  return { success: true, message: 'Work order deleted successfully' };
};

