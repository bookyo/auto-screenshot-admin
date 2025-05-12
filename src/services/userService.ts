import { User, CreateUserRequest } from '../types';
import { apiRequest } from './api';

export const getUsers = async (): Promise<User[]> => {
  return await apiRequest<User[]>('GET', '/users');
};

export const getUserById = async (id: string): Promise<User> => {
  return await apiRequest<User>('GET', `/users/${id}`);
};

export const createUser = async (userData: CreateUserRequest): Promise<User> => {
  return await apiRequest<User>('POST', '/users', userData);
};

export const updateUser = async (id: string, userData: Partial<CreateUserRequest>): Promise<User> => {
  return await apiRequest<User>('PUT', `/users/${id}`, userData);
};

export const deleteUser = async (id: string): Promise<void> => {
  return await apiRequest<void>('DELETE', `/users/${id}`);
};
