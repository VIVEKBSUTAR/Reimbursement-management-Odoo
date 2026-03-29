import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('company');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ Authentication ============
export const authAPI = {
  login: (email, password) => api.post('/auth/login/', { email, password }),
  signup: (data) => api.post('/auth/signup/', data),
  refreshToken: (refresh) => api.post('/auth/token/refresh/', { refresh }),
};

// ============ Users ============
export const usersAPI = {
  list: (params) => api.get('/users/', { params }),
  get: (id) => api.get(`/users/${id}/`),
  create: (data) => api.post('/users/', data),
  update: (id, data) => api.put(`/users/${id}/`, data),
  setManager: (id, managerId) => api.post(`/users/${id}/set-manager/`, { manager_id: managerId }),
  updatePreferences: (id, data) => api.patch(`/users/${id}/preferences/`, data),
};

// ============ Companies ============
export const companiesAPI = {
  get: (id) => api.get(`/companies/${id}/`),
  update: (id, data) => api.put(`/companies/${id}/`, data),
  getStats: (id) => api.get(`/companies/${id}/stats/`),
};

// ============ Expenses ============
export const expensesAPI = {
  list: (params) => api.get('/expenses/', { params }),
  get: (id) => api.get(`/expenses/${id}/`),
  create: (data) => api.post('/expenses/', data),
  update: (id, data) => api.put(`/expenses/${id}/`, data),
  delete: (id) => api.delete(`/expenses/${id}/`),
  getTimeline: (id) => api.get(`/expenses/${id}/timeline/`),
  submit: (id) => api.post(`/expenses/${id}/submit/`),
};

// ============ Approvals ============
export const approvalsAPI = {
  listPending: (params) => api.get('/approvals/', { params }),
  approve: (id, data) => api.post(`/approvals/${id}/approve/`, data),
  reject: (id, data) => api.post(`/approvals/${id}/reject/`, data),
  override: (id, action, data) => api.post(`/approvals/${id}/override/`, { action, ...data }),
};

// ============ Approval Flows ============
export const flowsAPI = {
  list: (params) => api.get('/flows/', { params }),
  get: (id) => api.get(`/flows/${id}/`),
  create: (data) => api.post('/flows/', data),
  update: (id, data) => api.put(`/flows/${id}/`, data),
  delete: (id) => api.delete(`/flows/${id}/`),
  activate: (id) => api.post(`/flows/${id}/activate/`),
  deactivate: (id) => api.post(`/flows/${id}/deactivate/`),
};

// ============ Rules ============
export const rulesAPI = {
  list: (params) => api.get('/rules/', { params }),
  get: (id) => api.get(`/rules/${id}/`),
  create: (data) => api.post('/rules/', data),
  update: (id, data) => api.put(`/rules/${id}/`, data),
  delete: (id) => api.delete(`/rules/${id}/`),
};

// ============ Currencies ============
export const currenciesAPI = {
  list: () => api.get('/currencies/'),
  convert: (amount, from, to) => api.post('/currencies/convert/', { amount, from_currency: from, to_currency: to }),
  getRate: (from, to) => api.get('/currencies/rate/', { params: { from_currency: from, to_currency: to } }),
};

// ============ OCR ============
export const ocrAPI = {
  processReceipt: (file) => {
    const formData = new FormData();
    formData.append('receipt', file);
    return api.post('/ocr/process/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ============ Receipts ============
export const receiptsAPI = {
  upload: (file, expenseId) => {
    const formData = new FormData();
    formData.append('file', file);
    if (expenseId) formData.append('expense_id', expenseId);
    return api.post('/receipts/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  get: (id) => api.get(`/receipts/${id}/`),
  delete: (id) => api.delete(`/receipts/${id}/`),
};

// ============ Audit Logs ============
export const auditAPI = {
  getExpenseTimeline: (expenseId) => api.get(`/audit/expenses/${expenseId}/timeline/`),
};

export default api;
