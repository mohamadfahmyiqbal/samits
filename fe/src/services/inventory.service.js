import api from './api.js';

const BASE_URL = '/inventory';

export const inventoryService = {
  // List all spare parts stock
  listParts: (params = {}) => api.get(`${BASE_URL}/parts`, { params }),

  // List tools inventory
  listTools: (params = {}) => api.get(`${BASE_URL}/tools`, { params }),

  // List stock transactions / movements
  listTransactions: (params = {}) => api.get(`${BASE_URL}/transactions`, { params }),

  // Get transactions summary/stats
  getTransactionsSummary: (params = {}) => api.get(`${BASE_URL}/transactions/summary`, { params }),

  // Export transactions CSV
  exportTransactions: (params = {}) => api.get(`${BASE_URL}/transactions/export`, { 
    params, 
    responseType: 'blob' 
  }),

  // Create stock transaction (add/consume/adjust)
  createTransaction: (data) => api.post(`${BASE_URL}/parts/transaction`, data),

  // Get stock summary/metrics
  getSummary: () => api.get(`${BASE_URL}/summary`), // assume BE endpoint or aggregate client-side

// Get low/critical stock alerts
  getAlerts: (params = {}) => api.get(`${BASE_URL}/alerts`, { params }),

  // Stock Opname APIs
  listOpname: (params = {}) => api.get(`${BASE_URL}/opname`, { params }),
  updateOpname: (id, data) => api.patch(`${BASE_URL}/opname/${id}`, data),
  startOpname: () => api.post(`${BASE_URL}/opname/start`),
  completeOpname: () => api.post(`${BASE_URL}/opname/complete`),
  exportOpname: (params = {}) => api.get(`${BASE_URL}/opname/export`, { params, responseType: 'blob' }),
};



export default inventoryService;

