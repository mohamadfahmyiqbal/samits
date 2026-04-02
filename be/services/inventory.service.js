import { db } from '../models/index.js';
import { Op, fn, col, QueryTypes } from 'sequelize';

const formatStockRow = (stock) => {
  const part = stock.part;
  const partId = part?.part_id ?? stock.part_id;
  return {
    id: stock.id,
    warehouse_id: stock.warehouse_id,
    part_id: partId,
    part_name: part?.part_name ?? null,
    category: part?.part_category ?? null,
    unit: part?.unit ?? null,
    minimum_stock: part?.minimum_stock ?? null,
    maximum_stock: part?.maximum_stock ?? null,
    price: part?.price ?? null,
    part_code: part?.part_code ?? null,
    current_stock: stock.qty ?? 0,
  };
};

const assertModelsReady = () => {
  const { WarehouseStock, InventoryTransaction, Part } = db;
  const missing = [];
  if (!WarehouseStock) missing.push('WarehouseStock');
  if (!InventoryTransaction) missing.push('InventoryTransaction');
  if (!Part) missing.push('Part');
  if (missing.length) {
    throw new Error(`Database models not initialized: ${missing.join(', ')}`);
  }
  return { WarehouseStock, InventoryTransaction, Part };
};

const aggregateUsageByWindow = async (InventoryTransaction, partIds = [], startDate) => {
  if (!partIds.length || !startDate) return {};
  const now = new Date();
  const usageRows = await InventoryTransaction.findAll({
    attributes: [
      'part_id',
      [fn('SUM', fn('ABS', col('qty'))), 'usage'],
    ],
    where: {
      part_id: partIds,
      trans_date: {
        [Op.gte]: startDate,
        [Op.lte]: now,
      },
    },
    group: ['part_id'],
    raw: true,
  });

  return usageRows.reduce((acc, row) => {
    acc[row.part_id] = Number(row.usage) || 0;
    return acc;
  }, {});
};

const normalizeDateRange = (value) => {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  const dates = values
    .map((item) => {
      if (!item) return null;
      if (item instanceof Date) return item;
      const parsed = new Date(item);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    })
    .filter(Boolean);
  if (!dates.length) return {};
  const [first, second] = dates;
  const startDate = first;
  let endDate = second;
  if (startDate && !endDate) {
    endDate = startDate;
  }
  if (endDate) {
    endDate = new Date(endDate);
    endDate.setHours(23, 59, 59, 999);
  }
  return { startDate, endDate };
};

const formatTransactionRow = (row) => {
  const part = row.part;
  const qty = Number(row.qty || row.quantity || 0);
  const type = row.type || (qty < 0 ? 'out' : 'in');
  return {
    id: row.trans_id,
    part_code: part?.part_code ?? null,
    part_name: part?.part_name ?? null,
    part_id: row.part_id,
    quantity: Math.abs(qty),
    unit: part?.unit ?? 'unit',
    type,
    stock_before: row.stock_before ?? null,
    stock_after: row.stock_after ?? null,
    status: row.status || 'completed',
    notes: row.notes ?? null,
    warehouse_id: row.warehouse_id ?? null,
    value: row.value ?? 0,
    created_at: row.trans_date ?? row.created_at ?? new Date(),
    created_by_name: row.created_by_name || null,
  };
};

const InventoryService = class {
  async listParts(params = {}) {
    const { WarehouseStock, InventoryTransaction, Part } = assertModelsReady();

    const stockWhere = {};
    if (params.warehouse_id) stockWhere.warehouse_id = params.warehouse_id;
    if (params.part_id) stockWhere.part_id = params.part_id;

    const partWhere = {};
    if (params.category) partWhere.part_category = params.category;

    const partInclude = {
      model: Part,
      as: 'part',
      attributes: ['part_id', 'part_name', 'part_category', 'unit', 'minimum_stock'],
      where: Object.keys(partWhere).length ? partWhere : undefined,
      required: Object.keys(partWhere).length > 0,
    };

    const limit = Math.min(100, Number(params.limit) || 50);
    const page = Math.max(1, Number(params.page) || 1);
    const offset = (page - 1) * limit;

    const { count, rows } = await WarehouseStock.findAndCountAll({
      where: stockWhere,
      include: [partInclude],
      order: [['qty', 'DESC']],
      limit,
      offset,
      attributes: ['id', 'warehouse_id', 'part_id', 'qty'],
    });

    const partIds = Array.from(
      new Set(rows.map((row) => row.part_id).filter((id) => id !== null && id !== undefined)),
    );
    const now = new Date();
    const monthlyStart = new Date(now);
    monthlyStart.setMonth(monthlyStart.getMonth() - 1);
    const yearlyStart = new Date(now);
    yearlyStart.setFullYear(yearlyStart.getFullYear() - 1);

    const [monthlyUsageMap, yearlyUsageMap] = await Promise.all([
      aggregateUsageByWindow(InventoryTransaction, partIds, monthlyStart),
      aggregateUsageByWindow(InventoryTransaction, partIds, yearlyStart),
    ]);

    const enrichedData = rows.map((row) => {
      const formatted = formatStockRow(row);
      const partId = formatted.part_id;
      return {
        ...formatted,
        monthly_usage: monthlyUsageMap[partId] ?? 0,
        yearly_usage: yearlyUsageMap[partId] ?? 0,
      };
    });

    return {
      success: true,
      data: enrichedData,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  async listTools(params = {}) {
    return this.listParts({ ...params, category: 'tools' });
  }

  async createTransaction(payload) {
    const { InventoryTransaction, WarehouseStock, Part } = assertModelsReady();

    let { stock_id, type, quantity } = payload;

    const result = await db.sequelize.transaction(async (t) => {
      let stock = null;
      if (stock_id) {
        stock = await WarehouseStock.findByPk(stock_id, { transaction: t });
      }
      if (!stock) {
        // Buat part/stock baru jika belum ada
        const partCode = payload.part_code?.trim();
        const partName = payload.part_name?.trim();
        if (!partCode && !partName) {
          throw new Error('Stock not found');
        }
        let part = null;
        if (partCode) {
          part = await Part.findOne({ where: { part_code: partCode }, transaction: t });
        }
        if (!part && partName) {
          part = await Part.findOne({ where: { part_name: partName }, transaction: t });
        }
        if (!part) {
        part = await Part.create(
          {
            part_code: partCode || null,
            part_name: partName,
            part_category: payload.category,
            unit: payload.unit,
            minimum_stock: payload.minimum_stock,
            status: payload.status || 'normal',
            purchase_period: payload.purchase_period,
          },
          {
            transaction: t,
            fields: [
              'part_code',
              'part_name',
              'part_category',
              'unit',
              'minimum_stock',
              'status',
              'purchase_period',
            ],
          },
        );
        }
        stock = await WarehouseStock.create(
          {
            part_id: part.part_id,
            warehouse_id: payload.warehouse_id || 1,
            qty: 0,
          },
          { transaction: t },
        );
        stock_id = stock.id;
      }

      const newStock =
        type === 'in' ? (stock.qty || 0) + quantity : (stock.qty || 0) - quantity;
      if (newStock < 0) throw new Error('Insufficient stock');

      await stock.update({ qty: newStock }, { transaction: t });

      if (Part && stock.part_id) {
        const part = await Part.findByPk(stock.part_id, { transaction: t });
        if (part) {
          const partUpdates = {};
          if (payload.part_name) partUpdates.part_name = payload.part_name;
          if (payload.category) partUpdates.part_category = payload.category;
          if (payload.unit) partUpdates.unit = payload.unit;
          if (payload.minimum_stock !== undefined) partUpdates.minimum_stock = payload.minimum_stock;
          if (payload.status) partUpdates.status = payload.status;
          if (payload.purchase_period) partUpdates.purchase_period = payload.purchase_period;
          if (Object.keys(partUpdates).length) {
            await part.update(partUpdates, { transaction: t });
          }
        }
      }

      if (Part && stock.part_id) {
        const part = await Part.findByPk(stock.part_id, { transaction: t });
        if (part) {
          const partUpdates = {};
          if (payload.part_name) partUpdates.part_name = payload.part_name;
          if (payload.category && payload.category !== part.part_category) partUpdates.part_category = payload.category;
          if (payload.unit) partUpdates.unit = payload.unit;
          if (payload.minimum_stock !== undefined) partUpdates.minimum_stock = payload.minimum_stock;
          if (payload.status) partUpdates.status = payload.status;
          if (payload.purchase_period) partUpdates.purchase_period = payload.purchase_period;
          if (payload.part_code) partUpdates.part_code = payload.part_code;
          if (Object.keys(partUpdates).length) {
            await part.update(partUpdates, { transaction: t });
          }
        }
      }

      const storedQty = type === 'out' ? -Math.abs(quantity) : Math.abs(quantity);
      await InventoryTransaction.create(
        {
          stock_id,
          part_id: stock.part_id,
          type,
          qty: storedQty,
          quantity,
          notes: payload.notes,
          user_id: payload.user_id || 1,
        },
        { transaction: t },
      );

      return { success: true, data: { stock_id, new_stock: newStock } };
    });

    return result;
  }

  async listTransactions(params = {}) {
    const { InventoryTransaction, Part } = assertModelsReady();

    const where = {};
    if (params.type) where.type = params.type;

    const { startDate, endDate } = normalizeDateRange(params.dateRange || params.date_range || params.range);
    if (startDate || endDate) {
      where.trans_date = {};
      if (startDate) where.trans_date[Op.gte] = startDate;
      if (endDate) where.trans_date[Op.lte] = endDate;
    }

    const search = (params.search || params.query || '').trim();
    if (search) {
      const matchedParts = await Part.findAll({
        attributes: ['part_id'],
        where: {
          [Op.or]: [
            { part_name: { [Op.like]: `%${search}%` } },
            { part_code: { [Op.like]: `%${search}%` } },
          ],
        },
      });
      const partIds = matchedParts.map((entry) => entry.part_id);
      if (partIds.length) {
        where.part_id = { [Op.in]: partIds };
      } else {
        where.part_id = -1;
      }
    }

    const limit = Math.max(1, Math.min(200, Number(params.limit) || 20));
    const page = Math.max(1, Number(params.page) || 1);
    const offset = (page - 1) * limit;

    const { count, rows } = await InventoryTransaction.findAndCountAll({
      where,
      include: [
        {
          model: Part,
          as: 'part',
          attributes: ['part_id', 'part_code', 'part_name', 'unit'],
        },
      ],
      order: [['trans_date', 'DESC']],
      limit,
      offset,
    });

    const items = rows.map((row) => formatTransactionRow(row));
    const stats = items.reduce(
      (acc, row) => {
        const qty = Number(row.quantity || 0);
        if (row.type === 'out') acc.totalOut += Math.abs(qty);
        else acc.totalIn += Math.abs(qty);
        acc.totalValue += Number(row.value || 0);
        return acc;
      },
      { totalIn: 0, totalOut: 0, totalValue: 0 },
    );

    return {
      items,
      page,
      limit,
      total: count,
      stats,
    };
  }

  async getTransactionsSummary(params = {}) {
    try {
      const { InventoryTransaction } = assertModelsReady();
      const { startDate, endDate } = normalizeDateRange(params.dateRange || params.date_range || params.range);
      const where = {};
      if (startDate || endDate) {
        where.trans_date = {};
        if (startDate) where.trans_date[Op.gte] = startDate;
        if (endDate) where.trans_date[Op.lte] = endDate;
      }

      const whereClauses = [];
      const replacements = {};
      if (startDate) {
        whereClauses.push('[trans_date] >= :startDate');
        replacements.startDate = startDate;
      }
      if (endDate) {
        whereClauses.push('[trans_date] <= :endDate');
        replacements.endDate = endDate;
      }
      const whereClause = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const [summaryRow] = await db.sequelize.query(
        `
          SELECT
            SUM(CASE WHEN [qty] >= 0 THEN [qty] ELSE 0 END) AS total_in,
            SUM(CASE WHEN [qty] < 0 THEN -[qty] ELSE 0 END) AS total_out
          FROM [inventory_transactions]
          ${whereClause}
        `,
        {
          type: QueryTypes.SELECT,
          replacements,
          plain: true,
        },
      );

      const totalIn = Number(summaryRow?.total_in) || 0;
      const totalOut = Number(summaryRow?.total_out) || 0;
      return { 
        success: true,
        data: { totalIn, totalOut, totalValue: 0 } 
      };
    } catch (error) {
      console.error('getTransactionsSummary error:', error);
      return { success: false, message: error.message };
    }
  }

  async exportTransactions(params = {}) {
    const { items } = await this.listTransactions({ ...params, page: 1, limit: Number(params.limit) || 500 });
    const csvHeader = ['ID', 'Part Code', 'Part Name', 'Type', 'Quantity', 'Status', 'Date', 'Warehouse'];
    const rows = items.map((item) =>
      [
        item.id,
        item.part_code,
        item.part_name,
        item.type,
        item.quantity,
        item.status,
        item.created_at,
        item.warehouse_id,
      ]
        .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
        .join(','),
    );
    const csv = [csvHeader.join(','), ...rows].join('\n');
    const fileName = `stock-movement-${new Date().toISOString().slice(0, 10)}.csv`;
    return { csv, fileName };
  }
};

export default new InventoryService();
