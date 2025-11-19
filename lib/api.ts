import axios from 'axios';

const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// API endpoints
export const userAPI = {
  fetchUsers: (params?: Record<string, any>) => apiClient.get('/users', { params }),
  fetchUser: (id: number) => apiClient.get(`/users/${id}`),
  addUser: (data: any) => apiClient.post('/users', data),
  updateUser: (id: number, data: any) => apiClient.put(`/users/${id}`, data),
  deleteUser: (id: number) => apiClient.delete(`/users/${id}`),
};
