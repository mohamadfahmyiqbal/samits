import ApiClient from '../utils/ApiClient.js';

const BASE_URL = '/api/maintenance';

export const fetchActiveLogs = () => ApiClient.get(`${BASE_URL}/active`);
export const fetchHistoryLogs = () => ApiClient.get(`${BASE_URL}/history`);
export const createSchedule = (data) => ApiClient.post(BASE_URL, data);
export const updateSchedule = (id, data) => ApiClient.put(`${BASE_URL}/${id}`, data);
export const deleteSchedule = (id) => ApiClient.delete(`${BASE_URL}/${id}`);

export default {
  fetchActiveLogs,
  fetchHistoryLogs,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};

