import { db } from '../models/index.js';
import { Op, fn, col } from 'sequelize';

const getModel = (name) => {
  const model = db[name];
  if (!model) {
    throw new Error(`Model ${name} belum terdaftar.`);
  }
  return model;
};

const getTemplateModel = () => getModel('MaintenanceChecklistTemplate');

class MaintenanceChecklistTemplateService {
  async listBySubCategory(subCategory) {
    const Template = getTemplateModel();
    const where = {};
    if (subCategory) {
      where.sub_category = subCategory;
    }
    const templates = await Template.findAll({
      where,
      order: [['template_label', 'ASC']],
    });

    if (templates.length > 0) {
      return { success: true, data: templates };
    }

    // fallback: ambil distinct template_label dari maintenance_checklists
    const Checklist = getModel('MaintenanceChecklist');
    const whereClause = {
      template_label: { [Op.ne]: null },
    };
    if (subCategory) {
      whereClause.sub_category = subCategory;
    }
    const checklistRows = await Checklist.findAll({
      attributes: [
        'template_id',
        'template_label',
        'sub_category',
        [fn('MIN', col('created_at')), 'created_at'],
      ],
      where: whereClause,
      group: ['template_id', 'template_label', 'sub_category'],
      order: [[fn('MIN', col('created_at')), 'ASC']],
      raw: true,
    });

    return { success: true, data: checklistRows };
  }

  async create(payload = {}) {
    const Template = getTemplateModel();
    const { sub_category, template_label, description } = payload;
    if (!sub_category || !template_label) {
      throw new Error('sub_category dan template_label wajib diisi.');
    }
    const created = await Template.create({
      sub_category,
      template_label,
      description: description || null,
    });
    return { success: true, data: created };
  }
}

export const maintenanceChecklistTemplateService = new MaintenanceChecklistTemplateService();
