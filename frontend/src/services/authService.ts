import { apiService } from './api';
import { LoginForm, RegisterForm, AuthResponse, User } from '../types';

class AuthService {
  // Регистрация пользователя
  async register(data: RegisterForm): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/register', data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Ошибка регистрации');
    }
  }

  // Вход пользователя
  async login(data: LoginForm): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login', data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Ошибка входа');
    }
  }

  // Проверка токена
  async verifyToken(token: string): Promise<{ user: User }> {
    try {
      apiService.setAuthToken(token);
      const response = await apiService.get<{ user: User }>('/auth/me');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Неверный токен');
    }
  }

  // Выход пользователя (локально)
  logout(): void {
    localStorage.removeItem('token');
    apiService.setAuthToken(null);
  }

  // Получить текущего пользователя
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiService.get<{ user: User }>('/auth/me');
      return response.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Ошибка получения пользователя');
    }
  }

  // Проверить, авторизован ли пользователь
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  // Получить токен из localStorage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Сохранить токен в localStorage
  setToken(token: string): void {
    localStorage.setItem('token', token);
    apiService.setAuthToken(token);
  }
}

export const authService = new AuthService();
export default authService;
