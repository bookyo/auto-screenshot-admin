import { jwtDecode } from 'jwt-decode';
import { User } from '../types';

const TOKEN_KEY = 'auto_screenshot_token';
const USER_KEY = 'auto_screenshot_user';

interface DecodedToken {
  exp: number;
  user: User;
}

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const setUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = (): User | null => {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch (error) {
    removeUser();
    return null;
  }
};

export const removeUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};

export const isAdmin = (): boolean => {
  const user = getUser();
  return !!user && user.role === 'admin';
};

export const logout = (): void => {
  removeToken();
  removeUser();
};
