import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  verify: () => api.get('/auth/verify')
};

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
