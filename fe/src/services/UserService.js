import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5002/api';
const API_URL = `${API_BASE.replace(/\/+$/, '')}/users`;

const userService = {
  getAllKaryawan: async () => {
    const response = await axios.get(`${API_URL}/getallkaryawan`, {
      withCredentials: true
    });
    return response.data;
  },
  getKaryawanByNik: async (nik) => {
    const response = await axios.get(`${API_URL}/karyawan/${nik}`, {
      withCredentials: true
    });
    return response.data;
  },
  registerUser: async (payload) => {
    const response = await axios.post(`${API_URL}/register`, payload, {
      withCredentials: true
    });
    return response.data;
  },
  getRoles: async () => {
    const response = await axios.get(`${API_URL}/roles`, {
      withCredentials: true
    });
    return response.data;
  }
};

export default userService;
