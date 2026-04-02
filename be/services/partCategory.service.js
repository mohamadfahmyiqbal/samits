import { db } from '../models/index.js';
import { QueryTypes } from 'sequelize';

const mapStats = (records) => {
  const statsMap = new Map();
  records.forEach((record) => {
    statsMap.set(Number(record.part_category_id), {
      total_items: Number(record.total_items ?? 0),
      low_stock_items: Number(record.low_stock_items ?? 0),
      critical_stock_items: Number(record.critical_stock_items ?? 0),
      total_parts: Number(record.total_parts ?? 0),
    });
  });
  return statsMap;
};

const buildCategoryPayload = (category, stats = {}) => {
  return {
    id: category.part_category_id,
    category_code: category.category_code,
    category_name: category.category_name,
    description: category.description,
    status: category.status,
    minimum_threshold: category.minimum_threshold,
    average_price: Number(category.average_price || 0),
    total_value: Number(category.total_value || 0),
    created_at: category.created_at,
    updated_at: category.updated_at,
    total_items: stats.total_items ?? 0,
    total_parts: stats.total_parts ?? 0,
    low_stock_items: stats.low_stock_items ?? 0,
    critical_stock_items: stats.critical_stock_items ?? 0,
  };
};

class PartCategoryService {
  async listPartCategories() {
    const { sequelize, PartCategory } = db;
    const stats = await sequelize.query(
      `
      SELECT
        pc.part_category_id,
        COUNT(DISTINCT p.part_id) AS total_parts,
        COALESCE(SUM(COALESCE(ws.qty, 0)), 0) AS total_items,
        COALESCE(SUM(CASE
          WHEN COALESCE(ws.qty, 0) <= COALESCE(p.minimum_stock, 0) THEN 1
          ELSE 0
        END), 0) AS low_stock_items,
        COALESCE(SUM(CASE
          WHEN COALESCE(ws.qty, 0) < COALESCE(p.minimum_stock, 0) * 0.5 THEN 1
          ELSE 0
        END), 0) AS critical_stock_items
      FROM part_categories pc
      LEFT JOIN parts p ON p.part_category = pc.category_code
      LEFT JOIN warehouse_stock ws ON ws.part_id = p.part_id
      GROUP BY pc.part_category_id
      `,
      { type: QueryTypes.SELECT },
    );

    const statsMap = mapStats(stats);
    const categories = await PartCategory.findAll({ order: [['created_at', 'DESC']] });
    return categories.map((category) =>
      buildCategoryPayload(category, statsMap.get(Number(category.part_category_id)) || {}),
    );
  }

  async createPartCategory(payload) {
    const { PartCategory } = db;
    const created = await PartCategory.create({
      category_code: payload.category_code.trim(),
      category_name: payload.category_name.trim(),
      description: payload.description || '',
      status: payload.status || 'active',
      minimum_threshold: Number(payload.minimum_threshold) || 20,
      average_price: Number(payload.average_price) || 0,
      total_value: Number(payload.total_value) || 0,
    });
    return buildCategoryPayload(created);
  }

  async updatePartCategory(id, payload) {
    const { PartCategory } = db;
    const existing = await PartCategory.findByPk(id);
    if (!existing) {
      throw new Error('Kategori tidak ditemukan.');
    }
    await existing.update({
      category_code: payload.category_code?.trim() || existing.category_code,
      category_name: payload.category_name?.trim() || existing.category_name,
      description: payload.description ?? existing.description,
      status: payload.status || existing.status,
      minimum_threshold: Number(payload.minimum_threshold ?? existing.minimum_threshold),
      average_price: Number(payload.average_price ?? existing.average_price),
      total_value: Number(payload.total_value ?? existing.total_value),
    });
    return buildCategoryPayload(await existing.reload());
  }

  async deletePartCategory(id) {
    const { PartCategory } = db;
    const deleted = await PartCategory.destroy({ where: { part_category_id: id } });
    if (!deleted) {
      const error = new Error('Kategori tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }
    return { id };
  }
}

export default new PartCategoryService();
