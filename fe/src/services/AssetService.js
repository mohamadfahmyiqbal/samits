// src/services/AssetService.js
// Layanan API Aset modern dengan error handling & timeout

const API_BASE = process.env.REACT_APP_API_BASE_URL
 ? process.env.REACT_APP_API_BASE_URL.replace(/\/+$/, '')
 : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'https://localhost:5002'
  : '') + '/api';
const API_BASE_URL = `${API_BASE.replace(/\/+$/, '')}/assets`;

// ---------------------------------------------------
// Helper: Ambil Token (DIHAPUS & TIDAK DIBUTUHKAN)
// ---------------------------------------------------
// ❌ DIHAPUS: Token kini di HTTP-only cookie dan otomatis dikirim browser.
// const getAuthToken = () => {
//   return localStorage.getItem('authToken');
// };

// ---------------------------------------------------
// Helper: Handle Response
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
  if (response.status === 401) {
   errorMessage = 'Silakan login terlebih dahulu';
  } else {
   const contentType = response.headers.get('Content-Type');
   if (contentType?.includes('text/html')) {
    errorMessage =
     'Server mengembalikan HTML, kemungkinan URL salah atau server tidak berjalan.';
   } else {
    errorMessage = response.statusText || errorMessage;
   }
  }
 }

 console.error('API Error:', response.status, errorMessage);
 throw new Error(errorMessage);
};

// ---------------------------------------------------
// Helper: apiFetch (MODIFIKASI KRITIS di sini)
// ---------------------------------------------------
const apiFetch = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  const isFormDataBody =
    typeof FormData !== 'undefined' &&
    options.body instanceof FormData;

  const headers = {
    ...options.headers,
  };

  if (
    !isFormDataBody &&
    !Object.prototype.hasOwnProperty.call(headers, 'Content-Type')
  ) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
    credentials: 'include',
    signal: controller.signal,
  };

  try {
    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout (15s)');
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

// ===================================================
// 1. GET: Ambil daftar Asset berdasarkan group
// ===================================================
export const fetchAssets = async (groupOrOptions) => {
 const params = new URLSearchParams();

 if (typeof groupOrOptions === 'string') {
  if (groupOrOptions) params.set('group', groupOrOptions);
 } else if (groupOrOptions && typeof groupOrOptions === 'object') {
  const { group, main_type_id, mainTypeId } = groupOrOptions;
  if (group) params.set('group', group);

  const resolvedMainTypeId = main_type_id ?? mainTypeId;
  if (
   resolvedMainTypeId !== undefined &&
   resolvedMainTypeId !== null &&
   resolvedMainTypeId !== ''
  ) {
   params.set('main_type_id', resolvedMainTypeId);
  }
 }

 const queryString = params.toString();
 const query = queryString ? `?${queryString}` : '';
 return apiFetch(`${API_BASE_URL}${query}`, { method: 'GET' });
};

export const fetchAssetsByQuery = async ({
 group,
 main_type_id,
 mainTypeId,
 category,
 category_id,
 type,
 sub_category_id,
} = {}) => {
 const params = new URLSearchParams();

 if (group) params.set('group', group);

 const resolvedMainTypeId = main_type_id ?? mainTypeId;
 if (
  resolvedMainTypeId !== undefined &&
  resolvedMainTypeId !== null &&
  resolvedMainTypeId !== ''
 ) {
  params.set('main_type_id', resolvedMainTypeId);
 }

 if (category) params.set('category', category);

 if (
  category_id !== undefined &&
  category_id !== null &&
  category_id !== ''
 ) {
  params.set('category_id', category_id);
 }

 if (type) params.set('type', type);

 if (
  sub_category_id !== undefined &&
  sub_category_id !== null &&
  sub_category_id !== ''
 ) {
  params.set('sub_category_id', sub_category_id);
 }

 const queryString = params.toString();
 const query = queryString ? `?${queryString}` : '';

 return apiFetch(`${API_BASE_URL}${query}`, {
  method: 'GET',
 });
};

// 2. POST: Create Asset
export const createAsset = async (assetData, attachments = []) => {
 if (Array.isArray(attachments) && attachments.length > 0) {
  const formData = new FormData();
  Object.entries(assetData || {}).forEach(([key, value]) => {
   if (value === undefined || value === null) return;
   formData.append(key, value);
  });
  attachments.forEach((file) => {
   if (file) {
    formData.append('attachments', file);
   }
  });

  return apiFetch(API_BASE_URL, {
   method: 'POST',
   body: formData,
  });
 }

 return apiFetch(API_BASE_URL, {
  method: 'POST',
  body: JSON.stringify(assetData),
 });
};

// 3. PUT: Update Asset
export const updateAsset = async (assetNo, updateData, attachments = []) => {
 if (Array.isArray(attachments) && attachments.length > 0) {
  const formData = new FormData();
  Object.entries(updateData || {}).forEach(([key, value]) => {
   if (value === undefined || value === null) return;
   formData.append(key, value);
  });
  attachments.forEach((file) => {
   if (file) {
    formData.append('attachments', file);
   }
  });

  return apiFetch(`${API_BASE_URL}/${assetNo}`, {
   method: 'PUT',
   body: formData,
  });
 }

 return apiFetch(`${API_BASE_URL}/${assetNo}`, {
  method: 'PUT',
  body: JSON.stringify(updateData),
 });
};

// 4. DELETE: Delete Asset
export const deleteAsset = async (assetNo) => {
 return apiFetch(`${API_BASE_URL}/${assetNo}`, { method: 'DELETE' });
};

// 4a. DELETE: Delete Asset Document
export const deleteAssetDocument = async (assetNo, documentId) => {
 return apiFetch(`${API_BASE_URL}/${assetNo}/documents/${documentId}`, { method: 'DELETE' });
};

// 5. GET: Get Asset Details
export const getAssetDetails = async (assetNo) => {
 return apiFetch(`${API_BASE_URL}/${assetNo}`, { method: 'GET' });
};

// 5b. GET: Get Sub Category Details by ID
export const fetchSubCategoryDetails = async (subCategoryId) => {
 if (!subCategoryId) {
  throw new Error('subCategoryId wajib diisi');
 }
 return apiFetch(`${API_BASE_URL}/subcategory/${subCategoryId}`, { method: 'GET' });
};

// ===================================================
// 6. GET: Ambil Master Data Categories & Types
// ===================================================
export const fetchCategories = async (group, mainTypeId = null) => {
 const params = new URLSearchParams();
 if (group) params.set('group', group);
 if (mainTypeId !== null && mainTypeId !== undefined && mainTypeId !== '') {
  params.set('asset_main_type_id', mainTypeId);
 }
 const queryString = params.toString();
 const query = queryString ? `?${queryString}` : '';
 return apiFetch(`${API_BASE_URL}/categories${query}`, { method: 'GET' });
};

export const fetchSubCategories = async (categoryId = null, mainTypeId = null) => {
 const params = new URLSearchParams();
 if (categoryId !== null && categoryId !== undefined && categoryId !== '') {
  params.set('category_id', categoryId);
 }
 if (mainTypeId !== null && mainTypeId !== undefined && mainTypeId !== '') {
  params.set('asset_main_type_id', mainTypeId);
 }
 const queryString = params.toString();
 const query = queryString ? `?${queryString}` : '';
 return apiFetch(`${API_BASE_URL}/subcategories${query}`, { method: 'GET' });
};

export const fetchCategoryTypes = async (group, mainTypeId = null, categoryId = null) => {
 const params = new URLSearchParams();
 if (group) params.set('group', group);
 if (mainTypeId !== null && mainTypeId !== undefined && mainTypeId !== '') {
  params.set('asset_main_type_id', mainTypeId);
 }
 if (categoryId !== null && categoryId !== undefined && categoryId !== '') {
  params.set('category_id', categoryId);
 }
 const queryString = params.toString();
 const query = queryString ? `?${queryString}` : '';
 return apiFetch(`${API_BASE_URL}/category-types${query}`, { method: 'GET' });
};

// ===================================================
// 7. GET: Ambil Master Data Classifications
// ===================================================
export const fetchClassifications = async () => {
 return apiFetch(`${API_BASE_URL}/classifications`, { method: 'GET' });
};

// ===================================================
// 8. GET: Ambil Asset Groups (Utama, Client, dll)
// ===================================================
export const fetchAssetGroups = async (
 mainTypeId = null,
 categoryId = null,
 subCategoryId = null
) => {
 const params = new URLSearchParams();
 if (mainTypeId !== null && mainTypeId !== undefined && mainTypeId !== '') {
  params.set('main_type_id', mainTypeId);
 }
 if (categoryId !== null && categoryId !== undefined && categoryId !== '') {
  params.set('category_id', categoryId);
 }
 if (subCategoryId !== null && subCategoryId !== undefined && subCategoryId !== '') {
  params.set('sub_category_id', subCategoryId);
 }
 const queryString = params.toString();
 const query = queryString ? `?${queryString}` : '';
 return apiFetch(`${API_BASE_URL}/asset-groups${query}`, { method: 'GET' });
};

// ===================================================
// 9. GET: Ambil Main Types (Hardware, Software, dll)
// ===================================================
export const fetchMainTypes = async () => {
 return apiFetch(`${API_BASE_URL}/main-types`, { method: 'GET' });
};

// ===================================================
// 10. GET: Ambil Status (Active, Inactive, In Repair, Disposed)
// ===================================================
export const fetchStatuses = async () => {
 return apiFetch(`${API_BASE_URL}/statuses`, { method: 'GET' });
};
