// be/controllers/workorder/workorder.controller.js
// Production-ready controller - hanya handle req/res/validation

import { 
  listWorkOrders as listWorkOrdersService, 
  createWorkOrder as createWorkOrderService, 
  completeWorkOrder as completeWorkOrderService, 
  getTechnicians as getTechniciansService, 
  getWorkOrderStats as getWorkOrderStatsService, 
  deleteWorkOrder as deleteWorkOrderService 
} from '../../services/workorder.service.js';
import { errorHandler } from '../../utils/errorHandler.js';

// Standardized response
const sendResponse = (res, data) => {
  res.status(data.success ? 200 : 400).json(data);
};

// GET /api/workorder - List work orders
export const listWorkOrders = async (req, res) => {
  try {
    const result = await listWorkOrdersService(req.query);
    sendResponse(res, result);
  } catch (error) {
    errorHandler(res, error);
  }
};

// POST /api/workorder - Create work order
export const createWorkOrder = async (req, res) => {
  try {
    // Basic validation
    if (!req.body.title || !req.body.assetId) {
      return res.status(400).json({
        success: false,
        message: 'Title dan Asset ID wajib diisi'
      });
    }

    const result = await createWorkOrderService(req.body);
    sendResponse(res, result);
  } catch (error) {
    errorHandler(res, error);
  }
};

// PUT /api/workorder/:wo_id/complete
export const completeWorkOrder = async (req, res) => {
  try {
    const { wo_id } = req.params;
    const result = await completeWorkOrderService(wo_id);
    sendResponse(res, result);
  } catch (error) {
    errorHandler(res, error);
  }
};

// GET /api/workorder/technicians
export const getTechnicians = async (req, res) => {
  try {
    const result = await getTechniciansService();
    sendResponse(res, result);
  } catch (error) {
    errorHandler(res, error);
  }
};

// GET /api/workorder/stats
export const getWorkOrderStats = async (req, res) => {
  try {
    const result = await getWorkOrderStatsService();
    sendResponse(res, result);
  } catch (error) {
    errorHandler(res, error);
  }
};

// DELETE /api/workorder/:id
export const deleteWorkOrder = async (req, res) => {
  try {
    const result = await deleteWorkOrderService(req.params.id);
    sendResponse(res, result);
  } catch (error) {
    errorHandler(res, error);
  }
};

// Placeholder for plans routes
export const listPlans = async (req, res) => res.json({ success: true, data: [] });
export const createPlan = async (req, res) => res.json({ success: true, data: [] });
