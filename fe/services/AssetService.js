/* fe/services/AssetService.js - API layer untuk Asset Management
* Production ready, error handling, consistent response
*/

const API_BASE =
  import.meta.env.VITE_API_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  'http://localhost:3001/api';

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
    console.error(`AssetService.${endpoint}:`, error);
    throw error;
  }
};

export const fetchAssets = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiCall(`/assets?${query}`);
};

export const createAsset = (payload, files = []) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    formData.append(key, value);
  });
  files.forEach(file => formData.append('attachments', file));

  return fetch(`${API_BASE}/assets`, {
    method: 'POST',
    body: formData,
  }).then(res => res.json());
};

export const updateAsset = (id, payload, files = []) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    formData.append(key, value);
  });
  files.forEach(file => formData.append('attachments', file));

  return fetch(`${API_BASE}/assets/${id}`, {
    method: 'PUT',
    body: formData,
  }).then(res => res.json());
};

export const deleteAsset = (id) => {
  return apiCall(`/assets/${id}`, { method: 'DELETE' });
};

export const getAssetByNo = (noAsset) => {
  return apiCall(`/assets/by-no/${noAsset}`);
};

export const fetchAssetDocuments = (id) => {
  return apiCall(`/assets/${id}/documents`);
};

export const fetchMainTypes = () => {
  return apiCall('/assets/main-types');
};

export default {
  fetchAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetByNo,
  fetchAssetDocuments,
};

