import { LoginRequest, LoginResponse, User, CreateUserRequest } from '../types';
import { apiRequest } from './api';
import { setToken, setUser, getUser, removeToken, removeUser } from '../utils/auth';

export const login = async (credentials: LoginRequest): Promise<User> => {
  const response = await apiRequest<LoginResponse>('POST', '/users/login', credentials);
  setToken(response.token);
  setUser(response.user);
  return response.user;
};

export const logout = (): void => {
  removeToken();
  removeUser();
  window.location.href = '/login';
};

export const getCurrentUser = (): User | null => {
  return getUser();
};

export const register = async (userData: CreateUserRequest): Promise<User> => {
  return await apiRequest<User>('POST', '/users', userData);
};
