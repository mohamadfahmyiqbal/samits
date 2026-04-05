import inventoryService from '../../services/inventory.service.js';
import { errorHandler } from '../../utils/errorHandler.js';

const sendResponse = (res, data) => {
  res.status(data.success ? 200 : 400).json(data);
};

export const listParts = async (req, res) => {
  try {
    const result = await inventoryService.listParts(req.query);
    sendResponse(res, result);
  } catch (error) {
    errorHandler(res, error);
  }
};

export const listTools = async (req, res) => {
  try {
    const result = await inventoryService.listTools(req.query);
    sendResponse(res, result);
  } catch (error) {
    errorHandler(res, error);
  }
};

export const createTransaction = async (req, res) => {
  try {
    const result = await inventoryService.createTransaction(req.body);
    res.status(201).json(result);
  } catch (error) {
    errorHandler(res, error);
  }
};

export const listTransactions = async (req, res) => {
  try {
    const result = await inventoryService.listTransactions(req.query);
    res.json(result);
  } catch (error) {
    errorHandler(res, error);
  }
};

export const getTransactionsSummary = async (req, res) => {
  try {
    const data = await inventoryService.getTransactionsSummary(req.query);
    res.json({ success: true, data });
  } catch (error) {
    errorHandler(res, error);
  }
};

export const exportTransactions = async (req, res) => {
  try {
    const { csv, fileName } = await inventoryService.exportTransactions(req.query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(csv);
  } catch (error) {
    errorHandler(res, error);
  }
};

export const getSummary = async (req, res) => {
  try {
    const parts = await inventoryService.listParts({ limit: 200 });
    const data = Array.isArray(parts.data) ? parts.data : [];

    const grouped = data.reduce((acc, part) => {
      const category = part.category || 'Uncategorized';
      const existing = acc[category] || {
        category,
        total: 0,
        available: 0,
        minStock: 0,
        reorder: 0,
        value: 0,
      };
      const qty = Number(part.current_stock || 0);
      const minStock = Number(part.minimum_stock || 0);
      existing.total += qty;
      existing.available += qty;
      existing.minStock += minStock;
      if (minStock > 0 && qty < minStock) {
        existing.reorder += 1;
      }
      existing.value += qty * Number(part.price || 0);
      acc[category] = existing;
      return acc;
    }, {});

    const summary = Object.values(grouped).map((row) => ({
      ...row,
      value: `Rp ${row.value.toLocaleString('id-ID')}`,
    }));

    sendResponse(res, { success: true, data: summary });
  } catch (error) {
    errorHandler(res, error);
  }
};

export const getAlerts = async (req, res) => {
  try {
    const parts = await inventoryService.listParts({ limit: 200 });
    const data = Array.isArray(parts.data) ? parts.data : [];
    const alerts = data.filter((part) => {
      const minStock = Number(part.minimum_stock ?? 0);
      const current = Number(part.current_stock ?? 0);
      return minStock > 0 && current <= minStock;
    });
    sendResponse(res, { success: true, data: alerts });
  } catch (error) {
    errorHandler(res, error);
  }
};

export default {
  listParts,
  listTools,
  createTransaction,
  listTransactions,
  getTransactionsSummary,
  exportTransactions,
  getSummary,
  getAlerts,
};
