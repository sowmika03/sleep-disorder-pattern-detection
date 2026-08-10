import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from './api';

export const authService = {
  async register(userData) {
    try {
      const response = await authAPI.register(userData);
      if (response.data?.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response;
    } catch (error) {
      console.error('Registration error in auth service:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  async login(email, password) {
    try {
      const response = await authAPI.login(email, password);
      if (response.data?.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response;
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
  },

  async getToken() {
    return await AsyncStorage.getItem('authToken');
  },

  async getUser() {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  },
};

