// fe/src/services/api.js - Centralized API client (Production Ready)
const API_BASE =
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_API_URL ||
  'https://localhost:5002/api';

const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || null;
};

const serializeParam = (value) => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (value instanceof Date) return value.toISOString();
  if (value?.toISOString) return value.toISOString();
  return JSON.stringify(value);
};

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    const entries = Array.isArray(value) ? value : [value];
    entries.forEach((entry) => {
      const serialized = serializeParam(entry);
      if (serialized !== undefined) {
        searchParams.append(key, serialized);
      }
    });
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

const apiCall = async (endpoint, options = {}) => {
  const baseUrl = endpoint.startsWith('/') ? `${API_BASE}${endpoint}` : `${API_BASE}/${endpoint}`;
  const queryString = buildQueryString(options.params);
  const url = `${baseUrl}${queryString}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const storedToken = getStoredToken();
  if (storedToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${storedToken}`;
  }

  const config = {
    method: options.method || 'GET',
    headers,
    credentials: 'include',
  };

  // Handle request body for POST/PUT/PATCH
  if (options.data && ['POST', 'PUT', 'PATCH'].includes(config.method.toUpperCase())) {
    config.body = JSON.stringify(options.data);
  }

  try {
  const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json().catch(() => ({}));
      } catch {
        errorData = {};
      }
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    if (options.responseType === 'blob') {
      return response.blob();
    }
    if (options.responseType === 'arraybuffer') {
      return response.arrayBuffer();
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export default {
  get: (endpoint, options = {}) => apiCall(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, data, options = {}) => apiCall(endpoint, { ...options, method: 'POST', data }),
  put: (endpoint, data, options = {}) => apiCall(endpoint, { ...options, method: 'PUT', data }),
  patch: (endpoint, data, options = {}) => apiCall(endpoint, { ...options, method: 'PATCH', data }),
  delete: (endpoint, options = {}) => apiCall(endpoint, { ...options, method: 'DELETE' }),
};
