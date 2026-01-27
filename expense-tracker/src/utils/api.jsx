import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://expense-tracker-production-9426.up.railway.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // ສາມາດເພີ່ມ token ໄດ້ທີ່ນີ້
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດ';
    return Promise.reject({ message, ...error.response?.data });
  }
);

// Categories API
export const categoryAPI = {
  getAll: (type) => api.get('/categories', { params: { type } }),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
  seed: () => api.post('/categories/seed'),
};

// Transactions API
export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getOne: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  getSummary: (params) => api.get('/transactions/summary', { params }),
  getByCategory: (params) => api.get('/transactions/by-category', { params }),
  getTrend: (params) => api.get('/transactions/trend', { params }),
};

// Budgets API
export const budgetAPI = {
  getAll: (params) => api.get('/budgets', { params }),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
};

export default api;