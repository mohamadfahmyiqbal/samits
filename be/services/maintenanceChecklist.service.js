import { db } from '../models/index.js';
import { Op } from 'sequelize';
import logger from '../utils/logger.js';

const getModel = (name) => {
  const model = db[name];
  if (!model) {
    throw new Error(`Model ${name} belum terdaftar.`);
  }
  return model;
};

const getChecklistModel = () => getModel('MaintenanceChecklist');

class MaintenanceChecklistService {
  async list(params = {}) {
    const Checklist = getChecklistModel();
    const where = {};
    if (params.wo_id) where.wo_id = Number(params.wo_id);
    if (params.work_type) where.work_type = params.work_type;
    if (params.category) where.category = params.category;
    if (params.sub_category) where.sub_category = params.sub_category;
    if (params.asset_id) where.asset_id = Number(params.asset_id);
    if (params.status) where.status = params.status;

    const limit = Math.min(100, Math.max(1, Number(params.limit) || 50));
    const page = Math.max(1, Number(params.page) || 1);
    const offset = (page - 1) * limit;

    const { count, rows } = await Checklist.findAndCountAll({
      where,
      order: [['item_no', 'ASC']],
      limit,
      offset,
    });

    return {
      success: true,
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  async findById(id) {
    const Checklist = getChecklistModel();
    const row = await Checklist.findByPk(id);
    if (!row) throw new Error(`Checklist ID ${id} tidak ditemukan`);
    return { success: true, data: row };
  }

  async create(payload) {
    const Checklist = getChecklistModel();
    const {
      wo_id,
      work_type = 'preventive',
      category,
      sub_category,
      asset_id,
      template_id,
      template_label,
      items,
    } = payload;

    if (!category || !items || !Array.isArray(items) || items.length === 0) {
      throw new Error('category dan items wajib diisi');
    }

    const normalizedWoId =
      wo_id !== undefined && wo_id !== null && Number.isFinite(Number(wo_id))
        ? Number(wo_id)
        : null;
    const normalizedTemplateId =
      template_id !== undefined && template_id !== null ? String(template_id) : null;

    const created = await Checklist.bulkCreate(
      items.map((item, index) => {
        const hasResult =
          item.result !== undefined &&
          item.result !== null &&
          String(item.result).trim().length > 0;
        const entryStatus = item.status || (hasResult ? 'done' : 'pending');

        return {
          wo_id: normalizedWoId,
          work_type,
          category,
          sub_category: sub_category || null,
          asset_id: asset_id || null,
          template_id: normalizedTemplateId,
          template_label: template_label || null,
          item_no: item.item_no || index + 1,
          item_description: item.item_description,
          item_range: item.item_range || null,
          result: item.result || null,
          notes: item.notes || null,
          status: entryStatus,
          completed_at: entryStatus === 'done' ? new Date() : null,
        };
      }),
    );

    return { success: true, data: created };
  }

  async update(id, payload) {
    const Checklist = getChecklistModel();
    const row = await Checklist.findByPk(id);
    if (!row) throw new Error(`Checklist ID ${id} tidak ditemukan`);

    logger.info('Updating maintenance checklist', {
      checklistId: id,
      payload,
      user: 'system', // replace with real user context when available
    });

    await row.update(payload);

    logger.info('Checklist update saved', {
      checklistId: row.checklist_id,
      templateLabel: row.template_label,
      status: row.status,
    });

    return { success: true, data: row };
  }

  async delete(id) {
    const Checklist = getChecklistModel();
    const row = await Checklist.findByPk(id);
    if (!row) throw new Error(`Checklist ID ${id} tidak ditemukan`);
    await row.destroy();
    return { success: true, message: 'Checklist berhasil dihapus' };
  }
}

export const maintenanceChecklistService = new MaintenanceChecklistService();
