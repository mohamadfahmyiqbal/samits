import { maintenanceChecklistService } from '../../services/maintenanceChecklist.service.js';
import { errorHandler } from '../../utils/errorHandler.js';

const sendResponse = (res, data) => {
  res.status(data.success ? 200 : 400).json(data);
};

export const listChecklists = async (req, res) => {
  try {
    const result = await maintenanceChecklistService.list(req.query);
    sendResponse(res, result);
  } catch (error) {
    errorHandler(res, error);
  }
};

export const getChecklist = async (req, res) => {
  try {
    const result = await maintenanceChecklistService.findById(req.params.id);
    sendResponse(res, result);
  } catch (error) {
    errorHandler(res, error);
  }
};

export const createChecklist = async (req, res) => {
  try {
    const result = await maintenanceChecklistService.create(req.body);
    sendResponse(res, result);
  } catch (error) {
    errorHandler(res, error);
  }
};

export const updateChecklist = async (req, res) => {
  try {
    const result = await maintenanceChecklistService.update(req.params.id, req.body);
    sendResponse(res, result);
  } catch (error) {
    errorHandler(res, error);
  }
};

export const deleteChecklist = async (req, res) => {
  try {
    const result = await maintenanceChecklistService.delete(req.params.id);
    sendResponse(res, result);
  } catch (error) {
    errorHandler(res, error);
  }
};
