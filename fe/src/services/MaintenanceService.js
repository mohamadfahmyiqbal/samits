// src/services/MaintenanceService.js
// 🛑 HAPUS BARIS INI: import { api } from "../utils/ApiClient";

// 1. Definisikan URL Root API yang Benar dan Mutlak (Absolute URL)
// Ganti dengan domain & port backend HTTPS Anda
const API_ROOT_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:5002/api';
const BASE_URL = `${API_ROOT_URL}/maintenance`;

// ---------------------------------------------------
// Helper: Handle Response (Diambil dari pola AssetService.js)
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
    // 🔑 KRITIS: Memaksa browser menyertakan cookie otentikasi
    credentials: 'include',
  };
  const response = await fetch(url, finalConfig);
  return handleResponse(response);
};

/**
 * Mengambil semua log maintenance yang statusnya aktif/pending.
 */
export const fetchActiveLogs = async () => {
  // ✅ Menggunakan apiFetch dan BASE_URL yang sudah benar
  return await apiFetch(`${BASE_URL}/active`, { method: 'GET' });
};

/**
 * Mengambil semua log maintenance yang sudah selesai dan diarsipkan.
 */
export const fetchHistoryLogs = async () => {
  return await apiFetch(`${BASE_URL}/history`, { method: 'GET' });
};

/**
 * Ambil detail schedule berdasarkan plan ID.
 */
export const fetchSchedule = async (planId) => {
  return await apiFetch(`${BASE_URL}/${planId}`, {
    method: 'GET',
  });
};

/**
 * Mengirim pembaruan ke log maintenance tertentu (misalnya, status 'in-progress' atau 'done').
 */
export const updateLog = async (assetId, updateData) => {
  return await apiFetch(`${BASE_URL}/${assetId}`, {
    method: 'PUT',
    // 💡 Penting: PUT/POST harus mengirimkan data sebagai JSON string
    body: JSON.stringify(updateData),
  });
};

/**
 * Membuat log maintenance baru (schedule baru).
 */
export const createLog = async (logData) => {
  return await apiFetch(`${BASE_URL}`, {
    method: 'POST',
    body: JSON.stringify(logData),
  });
};

/**
 * Hapus schedule maintenance (hanya pending).
 */
export const deleteLog = async (planId) => {
  return await apiFetch(`${BASE_URL}/${planId}`, {
    method: 'DELETE',
  });
};

/**
 * Kirim request approval untuk schedule.
 */
export const requestApproval = async (planId, payload = {}) => {
  return await apiFetch(`${BASE_URL}/${planId}/request-approval`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};
