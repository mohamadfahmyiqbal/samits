// src/services/CategoryService.js
// Service untuk mengambil data kategori maintenance dari backend

const API_ROOT_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:5002/api';
const BASE_URL = `${API_ROOT_URL}/assets`;

// Helper: Handle Response
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

// Helper: Fetch dengan konfigurasi yang benar
const apiFetch = async (url, config = {}) => {
  const finalConfig = {
    ...config,
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
    credentials: 'include',
  };
  const response = await fetch(url, finalConfig);
  return handleResponse(response);
};

/**
 * Mengambil semua Main Types
 */
export const fetchMainTypes = async () => {
  return await apiFetch(`${BASE_URL}/main-types`, { method: 'GET' });
};

/**
 * Mengambil kategori berdasarkan main type
 */
export const fetchCategoriesByMainType = async (mainTypeId) => {
  return await apiFetch(`${BASE_URL}/category-types?asset_main_type_id=${mainTypeId}`, {
    method: 'GET',
  });
};

/**
 * Mengambil semua kategori
 */
export const fetchAllCategories = async () => {
  return await apiFetch(`${BASE_URL}/category-types`, { method: 'GET' });
};

/**
 * Mengambil subkategori berdasarkan kategori
 */
export const fetchSubCategoriesByCategory = async (categoryId) => {
  return await apiFetch(`${BASE_URL}/category-types?category_id=${categoryId}`, { method: 'GET' });
};

/**
 * Mengambil semua subkategori
 */
export const fetchAllSubCategories = async () => {
  return await apiFetch(`${BASE_URL}/category-types`, { method: 'GET' });
};

/**
 * Mengambil IT items/assets berdasarkan kategori dan subkategori
 */
export const fetchITItemsByCategory = async (categoryId, subCategoryId, mainTypeId = null) => {
  const params = new URLSearchParams();
  if (categoryId) params.append('category_id', categoryId);
  if (subCategoryId) params.append('sub_category_id', subCategoryId);
  if (mainTypeId) params.append('main_type_id', mainTypeId);

  return await apiFetch(`${BASE_URL}/?${params.toString()}`, { method: 'GET' });
};
