import axios, { AxiosRequestConfig } from 'axios';
import { getToken } from '../utils/auth';

// Create axios instance with base URL
const API_URL = process.env.REACT_APP_API_URL || 'https://api.reelbit.cc';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Generic API request function
export const apiRequest = async <T>(
  method: string,
  url: string,
  data?: any,
  options?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await api({
      method,
      url,
      data,
      ...options,
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred');
    }
    throw new Error('Network error');
  }
};

export default api;
