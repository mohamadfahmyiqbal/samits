import axios from 'axios';
import { API_BASE } from '../config/api';

const API_URL = `${API_BASE}/users`;

const userService = {
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
};

export default userService;
