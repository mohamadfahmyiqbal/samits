/* fe/services/MaintenanceChecklistService.js - API layer untuk Maintenance Checklists
* Production ready, error handling, consistent response
*/

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`MaintenanceChecklistService.${endpoint}:`, error);
    throw error;
  }
};

export const fetchChecksheets = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiCall(`/maintenance/checklists?${query}`);
};

export const createChecksheet = (payload) => {
  return apiCall('/maintenance/checklists', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateChecksheet = (id, payload) => {
  return apiCall(`/maintenance/checklists/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const deleteChecksheet = (id) => {
  return apiCall(`/maintenance/checklists/${id}`, { method: 'DELETE' });
};

export const assignChecksheet = (checklistId, targetId, type) => {
  return apiCall(`/maintenance/checklists/${checklistId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ targetId, type }), // type: 'asset' | 'workorder'
  });
};

export default {
  fetchChecksheets,
  createChecksheet,
  updateChecksheet,
  deleteChecksheet,
  assignChecksheet,
};

