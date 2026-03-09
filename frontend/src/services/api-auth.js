import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses (unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) =>
    apiClient.post('/api/auth/login', { email, password }),
  register: (email, password, name, initial_bankroll) =>
    apiClient.post('/api/auth/register', { email, password, name, initial_bankroll }),
  getMe: () =>
    apiClient.get('/api/auth/me'),
  updateProfile: (name, initial_bankroll) =>
    apiClient.put('/api/auth/profile', { name, initial_bankroll }),
  changePassword: (currentPassword, newPassword) =>
    apiClient.post('/api/auth/change-password', { currentPassword, newPassword }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Bets API
export const betsAPI = {
  getAll: (filters = {}) =>
    apiClient.get('/api/bets', { params: filters }),
  getById: (id) =>
    apiClient.get(`/api/bets/${id}`),
  create: (data) =>
    apiClient.post('/api/bets', data),
  update: (id, data) =>
    apiClient.put(`/api/bets/${id}`, data),
  delete: (id) =>
    apiClient.delete(`/api/bets/${id}`),
  getStatistics: () =>
    apiClient.get('/api/bets/statistics'),
  getDailyStats: (days = 30) =>
    apiClient.get(`/api/bets/daily-stats?days=${days}`)
};

// Bookmakers API
export const bookmakersAPI = {
  getAll: () =>
    apiClient.get('/api/bookmakers'),
  getById: (id) =>
    apiClient.get(`/api/bookmakers/${id}`),
  create: (data) =>
    apiClient.post('/api/bookmakers', data),
  update: (id, data) =>
    apiClient.put(`/api/bookmakers/${id}`, data),
  delete: (id) =>
    apiClient.delete(`/api/bookmakers/${id}`),
  updateBalance: (id, balance) =>
    apiClient.post(`/api/bookmakers/${id}/balance`, { balance })
};

// Operations API
export const operationsAPI = {
  getAll: () =>
    apiClient.get('/api/operations'),
  getById: (id) =>
    apiClient.get(`/api/operations/${id}`),
  create: (data) =>
    apiClient.post('/api/operations', data),
  update: (id, data) =>
    apiClient.put(`/api/operations/${id}`, data),
  delete: (id) =>
    apiClient.delete(`/api/operations/${id}`)
};

// Dashboard API
export const dashboardAPI = {
  getOverview: () =>
    apiClient.get('/api/dashboard/overview'),
  getBankrollHistory: (days = 30) =>
    apiClient.get(`/api/dashboard/bankroll-history?days=${days}`),
  getRecentBets: (limit = 10) =>
    apiClient.get(`/api/dashboard/recent-bets?limit=${limit}`),
  getPerformance: (days = 30) =>
    apiClient.get(`/api/dashboard/performance?days=${days}`),
  getDailyStats: (days = 30) =>
    apiClient.get(`/api/dashboard/daily-stats?days=${days}`)
};

// Calculators API
export const calculatorsAPI = {
  calculateArbitrage: (odds) =>
    apiClient.post('/api/calculators/arbitrage', { odds }),
  calculateExchange: (backOdds, layOdds, stake) =>
    apiClient.post('/api/calculators/exchange', { backOdds, layOdds, stake }),
  calculateOddsBoost: (boostedOdds, normalOdds, stake) =>
    apiClient.post('/api/calculators/odds-boost', { boostedOdds, normalOdds, stake }),
  calculateDutching: (odds, stake) =>
    apiClient.post('/api/calculators/dutching', { odds, stake })
};

export default apiClient;
