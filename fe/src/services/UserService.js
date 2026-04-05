import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://localhost:5002/api';
const API_URL = `${API_BASE.replace(/\/+$/, '')}/users`;

const userService = {
  login: async (credentials) => {
    const response = await axios.post(`${API_URL}/login`, credentials, {
      withCredentials: true,
    });
    return response.data;
  },
  getAllKaryawan: async () => {
    const response = await axios.get(`${API_URL}/getallkaryawan`, {
      withCredentials: true,
    });
    return response.data;
  },
  getKaryawanByNik: async (nik) => {
    const response = await axios.get(`${API_URL}/karyawan/${nik}`, {
      withCredentials: true,
    });
    return response.data;
  },
  registerUser: async (payload) => {
    const response = await axios.post(`${API_URL}/register`, payload, {
      withCredentials: true,
    });
    return response.data;
  },
  getRoles: async () => {
    const response = await axios.get(`${API_URL}/roles`, {
      withCredentials: true,
    });
    return response.data;
  },
  listLocalUsers: async () => {
    const response = await axios.get(`${API_URL}/local`, {
      withCredentials: true,
    });
    return response.data;
  },
  updateUser: async (nik, payload) => {
    const response = await axios.put(`${API_URL}/${nik}`, payload, {
      withCredentials: true,
    });
    return response.data;
  },
  deleteUser: async (nik) => {
    const response = await axios.delete(`${API_URL}/${nik}`, {
      withCredentials: true,
    });
    return response.data;
  },
  fetchMaintenanceUsers: async () => {
    const response = await axios.get(`${API_URL}/maintenance-team`, {
      withCredentials: true,
    });
    return response.data;
  },
};

export default userService;
