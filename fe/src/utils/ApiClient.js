// src/utils/apiClient.js

import axios from 'axios';

// 💡 Tentukan Base URL Anda
const BASE_URL = 'http://localhost:5000/api'; // GANTI dengan alamat backend Anda

// 1. Buat instance Axios
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Tambahkan Interceptor (Untuk Otentikasi)
api.interceptors.request.use(
  (config) => {
    // ⚠️ Ganti 'authToken' jika Anda menggunakan nama kunci yang berbeda
    const token = localStorage.getItem('authToken'); 
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Eksport instance API
export { api };