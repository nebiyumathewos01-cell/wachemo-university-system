import axios from 'axios';

const API = axios.create({
  baseURL: 'https://wachemo-university-system-backend.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — only redirect if not already on auth pages
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authPages = ['/login', '/register', '/forgot-password', '/reset-password'];
      const isAuthPage = authPages.some((p) => window.location.pathname.startsWith(p));
      if (!isAuthPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword = (token, data) => API.post(`/auth/reset-password/${token}`, data);
export const changePassword = (data) => API.put('/auth/change-password', data);

// ─── Student ─────────────────────────────────────────────
export const getProfile = () => API.get('/students/profile');
export const updateProfile = (data) => API.put('/students/profile', data);
export const uploadProfilePhoto = (data) => API.put('/students/profile/photo', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getAllStudents = (params) => API.get('/students', { params });
export const getStudentById = (id) => API.get(`/students/${id}`);

// ─── Applications ────────────────────────────────────────
export const submitApplication = (data) => API.post('/applications', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getMyApplication = () => API.get('/applications/my');
export const getAllApplications = (params) => API.get('/applications', { params });
export const getApplicationById = (id) => API.get(`/applications/${id}`);
export const updateApplicationStatus = (id, data) => API.put(`/applications/${id}/status`, data);
export const updateChecklist = (id, data) => API.put(`/applications/${id}/checklist`, data);
export const downloadApprovalLetter = (id) => API.get(`/applications/${id}/letter`, { responseType: 'blob' });

// ─── Payments ────────────────────────────────────────────
export const getMyPayments = () => API.get('/payments/my');
export const generateMonthlyPayments = (data) => API.post('/payments/generate', data);
export const getAllPayments = (params) => API.get('/payments', { params });
export const markAsPaid = (id, data) => API.put(`/payments/${id}/pay`, data);
export const getPaymentStats = (params) => API.get('/payments/stats', { params });
export const exportPaymentsExcel = (params) => API.get('/payments/export/excel', { params, responseType: 'blob' });
export const exportPaymentsPDF = (params) => API.get('/payments/export/pdf', { params, responseType: 'blob' });

// ─── Notifications ───────────────────────────────────────
export const getNotifications = (params) => API.get('/notifications', { params });
export const markNotificationRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => API.put('/notifications/read-all');
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);

// ─── Admin ───────────────────────────────────────────────
export const getDashboardStats = () => API.get('/admin/stats');
export const getAllUsers = (params) => API.get('/admin/users', { params });
export const toggleUserStatus = (id) => API.put(`/admin/users/${id}/toggle`);
export const getAuditLogs = (params) => API.get('/admin/audit-logs', { params });
export const sendBroadcastNotification = (data) => API.post('/admin/notify', data);

export default API;
