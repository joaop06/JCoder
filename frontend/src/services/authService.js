import api from './api';

export const authService = {
  // Login do usuário
  async login(email, password) {
    try {
      const response = await api.post('/auth/sign-in', { email, password });
      const { user, accessToken } = response.data;

      // Armazenar o token no localStorage
      localStorage.setItem('accessToken', accessToken);

      // Buscar informações do usuário
      localStorage.setItem('user', JSON.stringify(user));

      return { accessToken, user };
    } catch (error) {
      throw error;
    }
  },

  // Registro de usuário
  async register(name, email, password) {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Registro de administrador
  async registerAdmin(name, email, password) {
    try {
      const response = await api.post('/auth/register/admin', { name, email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obter perfil do usuário
  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  },

  // Verificar se o usuário está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  },

  // Obter usuário do localStorage
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Verificar se o usuário é admin
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  }
};
