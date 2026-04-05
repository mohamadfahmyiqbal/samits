// src/config/api.js
// Konfigurasi API terpusat untuk seluruh aplikasi

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:5002/api';

export const API_BASE = API_BASE_URL.replace(/\/+$/, '');

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '');

// Helper untuk resolve URL dokumen
export const resolveDocumentUrl = (fileUrl) => {
  if (!fileUrl) return '';

  // Check if the URL is already absolute or a data URL/blob URL
  if (
    /^(https?:)?\/\//i.test(fileUrl) ||
    fileUrl.startsWith('blob:') ||
    fileUrl.startsWith('data:')
  ) {
    return fileUrl;
  }

  // Prepend API_ORIGIN if it's a relative path
  return `${API_ORIGIN}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
};

// API endpoints yang sering digunakan
export const API_ENDPOINTS = {
  ASSETS: `${API_BASE_URL}/assets`,
  DASHBOARD: `${API_BASE_URL}/dashboard`,
  PUSH: `${API_BASE_URL}/push`,
  AUTH: `${API_BASE_URL}/auth`,
};
