// Mock service - replace with real API when backend ready
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:5002/api';
const BASE_URL = `${API_BASE_URL}/maintenance/checklists`;

const handleResponse = async (response) => {
  if (response.ok) {
    if (response.status === 204) return { message: 'No content' };
    try {
      return await response.json();
    } catch {
      return { message: 'No content returned' };
    }
  }

  let errorMessage = `HTTP Error ${response.status}`;
  try {
    const body = await response.json();
    errorMessage = body.message || errorMessage;
  } catch {
    errorMessage = response.statusText || errorMessage;
  }

  throw new Error(errorMessage);
};

const apiFetch = async (url, config = {}) => {
  const response = await fetch(url, {
    ...config,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
  });
  return handleResponse(response);
};

const buildQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.set(key, value);
  });
  return query.toString();
};

const maintenanceChecklistService = {
  list: async (params = {}) => {
    const query = buildQuery(params);
    const url = query ? `${BASE_URL}?${query}` : BASE_URL;
    return apiFetch(url, { method: 'GET' });
  },
  listTemplates: async (params = {}) => {
    const query = buildQuery(params);
    const url = `${BASE_URL}/templates${query ? `?${query}` : ''}`;
    return apiFetch(url, { method: 'GET' });
  },
  createTemplate: async (payload) =>
    apiFetch(`${BASE_URL}/templates`, { method: 'POST', body: JSON.stringify(payload) }),
  get: async (id) => apiFetch(`${BASE_URL}/${id}`, { method: 'GET' }),
  create: async (payload) =>
    apiFetch(BASE_URL, { method: 'POST', body: JSON.stringify(payload) }),
  update: async (id, payload) =>
    apiFetch(`${BASE_URL}/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  delete: async (id) => apiFetch(`${BASE_URL}/${id}`, { method: 'DELETE' }),
};

export default maintenanceChecklistService;


