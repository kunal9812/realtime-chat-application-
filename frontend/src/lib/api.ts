import axios from 'axios';
import Cookies from 'js-cookie';

const apiClient = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (username: string, email: string, password: string) => apiClient.post('/auth/register', { username, email, password }),
  login: (email: string, password: string) => apiClient.post('/auth/login', { email, password }),
  logout: () => apiClient.post('/auth/logout'),
  me: () => apiClient.get('/auth/me'),
};

export const roomsApi = {
  list: () => apiClient.get('/rooms'),
  create: (data: any) => apiClient.post('/rooms', data),
  get: (roomId: string) => apiClient.get(`/rooms/${roomId}`),
  join: (roomId: string) => apiClient.post(`/rooms/${roomId}/join`),
  createDM: (targetUserId: string) => apiClient.post('/rooms/dm', { targetUserId }),
};

export const messagesApi = {
  getHistory: (roomId: string, cursor?: string, limit = 50) => apiClient.get(`/messages/${roomId}`, { params: { cursor, limit } }),
};

export const usersApi = {
  search: (q: string) => apiClient.get('/users/search', { params: { q } }),
  getProfile: (userId: string) => apiClient.get(`/users/${userId}`),
};
