import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('API Register Error:', error);
      console.error('Request URL:', `${api.defaults.baseURL}/auth/register`);
      console.error('Request Data:', userData);
      throw error;
    }
  },
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('API Login Error:', error);
      throw error;
    }
  },
};

// Activity API
export const activityAPI = {
  upload: async (activities) => {
    try {
      console.log('API Upload - Activities count:', activities.length);
      console.log('API Upload - Sample activity:', activities[0]);
      const response = await api.post('/activity/upload', { activities });
      return response.data;
    } catch (error) {
      console.error('API Upload Error:', error);
      console.error('Request URL:', `${api.defaults.baseURL}/activity/upload`);
      console.error('Request Data:', { activities });
      throw error;
    }
  },
  getHistory: async (startDate, endDate, limit) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (limit) params.limit = limit;
    const response = await api.get('/activity/history', { params });
    return response.data;
  },
};

// Prediction API
export const predictionAPI = {
  run: async (days = 7) => {
    const response = await api.post('/prediction/run', { days });
    return response.data;
  },
  getLatest: async () => {
    const response = await api.get('/prediction/latest');
    return response.data;
  },
};

// Recommendation API
export const recommendationAPI = {
  getAll: async (unreadOnly = false) => {
    const response = await api.get('/recommendations', {
      params: { unreadOnly },
    });
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await api.patch(`/recommendations/${id}/read`);
    return response.data;
  },
};

export default api;

