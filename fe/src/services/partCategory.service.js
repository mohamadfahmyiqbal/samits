import api from './api.js';

const ENDPOINT = '/master/part-categories';

const partCategoryService = {
  list: () => api.get(ENDPOINT),
  create: (payload) => api.post(ENDPOINT, payload),
  update: (id, payload) => api.put(`${ENDPOINT}/${id}`, payload),
  remove: (id) => api.delete(`${ENDPOINT}/${id}`),
};

export default partCategoryService;
