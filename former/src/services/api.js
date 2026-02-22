import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

export const diagnosisAPI = {
  predict: (formData) => api.post('/diagnosis/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  list: () => api.get('/diagnosis/list'),
  getById: (id) => api.get(`/diagnosis/${id}`),
  generateReport: (id, reportType) => api.post(`/diagnosis/${id}/report`, { report_type: reportType })
};

export const userAPI = {
  getAll: () => api.get('/users')
};

export default api;
