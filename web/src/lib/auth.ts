import axios from './axios';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  role?: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  profile?: Record<string, unknown>;
}

interface AuthResponse {
  message: string;
  access_token: string;
  user: User;
}

export const authService = {

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>('/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async register(data: RegisterData): Promise<unknown> {
    const response = await axios.post('/auth/register', data);
    return response.data;
  },

  async resetPassword(data: { email: string; newPassword: string }): Promise<unknown> {
    // Endpoint backend yang harus disediakan: /auth/reset-password
    const response = await axios.post('/auth/reset-password', data);
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getUser(): User | null {
    const user = localStorage.getItem('user')
    if (!user) return null
    try {
      return JSON.parse(user) as User
    } catch {
      return null
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
