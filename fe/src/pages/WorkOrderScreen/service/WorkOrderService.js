// src/pages/WorkOrderScreen/service/WorkOrderService.js
// Production-ready service dengan pola MaintenanceService

// 1. Definisikan URL Root API dari environment variable
const API_ROOT_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:5002/api';
const BASE_URL = `${API_ROOT_URL}/workorder`;

// ---------------------------------------------------
// Helper: Handle Response (Copy exact dari MaintenanceService)
// ---------------------------------------------------
const handleResponse = async (response) => {
  if (response.ok) {
    if (response.status === 204) return { message: 'Operation successful' };
    try {
      return await response.json();
    } catch {
      return { message: 'Operation successful, no content returned' };
    }
  }

  let errorMessage = `Kesalahan Jaringan (${response.status})`;

  try {
    const errorBody = await response.json();
    errorMessage = errorBody.message || errorMessage;
  } catch {
    errorMessage = response.statusText || errorMessage;
  }

  console.error('API Error:', response.url, errorMessage);
  throw new Error(errorMessage);
};

// ---------------------------------------------------
// Helper: Fetch dengan konfigurasi yang benar
// ---------------------------------------------------
const apiFetch = async (url, config = {}) => {
  const finalConfig = {
    ...config,
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
    credentials: 'include', // ✅ Cookie auth
  };
  const response = await fetch(url, finalConfig);
  return handleResponse(response);
};

/**
 * Fetch work orders dengan filters
 * @param {Object} filters - {status, priority, technician, dateRange}
 */
export const fetchWorkOrders = async (filters = {}) => {
  let params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== 'all' && value) params.append(key, value);
  });

  return await apiFetch(`${BASE_URL}?${params.toString()}`);
};

/**
 * Fetch list technicians
 */
export const fetchTechnicians = async () => {
  return await apiFetch(`${BASE_URL}/technicians`);
};

/**
 * Fetch work order statistics
 */
export const fetchWorkOrderStats = async () => {
  return await apiFetch(`${BASE_URL}/stats`);
};

/**
 * Delete work order
 * Digunakan di WorkOrderScreen.jsx
 */
export const deleteWorkOrder = async (id) => {
  return await apiFetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
};

export const startWorkOrder = async (id, payload = {}) => {
  return await apiFetch(`${BASE_URL}/${id}/start`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const assignWorkOrder = async (id, data = {}) => {
  return await apiFetch(`${BASE_URL}/${id}/assign`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const completeWorkOrder = async (id, data = {}) => {
  return await apiFetch(`${BASE_URL}/${id}/complete`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// Future exports (untuk modals):
export const createWorkOrder = async (data) => {
  return await apiFetch(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateWorkOrder = async (id, data) => {
  return await apiFetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};
