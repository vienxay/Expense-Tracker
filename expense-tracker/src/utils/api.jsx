import axios from 'axios';

// ✅ ໃຊ້ window.location ເພື່ອກວດວ່າເປັນ localhost ຫຼືບໍ່
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';

const API_BASE_URL = isLocalhost 
  ? '/api'  // Local: ໃຊ້ proxy → localhost:5000
  : 'https://expense-tracker-production-9426.up.railway.app/api'; // Production: Railway

console.log('🌍 Environment:', isLocalhost ? 'Local' : 'Production');
console.log('🔗 API URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', config.method.toUpperCase(), config.url);
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
    console.error('❌ API Error:', error.response?.status, error.message);
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