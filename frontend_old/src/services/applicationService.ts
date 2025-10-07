import api from './api';

export const applicationService = {
  // Buscar todas as aplicações
  async getAll() {
    try {
      const response = await api.get('/applications');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Buscar uma aplicação por ID
  async getById(id: number) {
    try {
      const response = await api.get(`/applications/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Criar uma nova aplicação
  async create(applicationData: any) {
    try {
      const response = await api.post('/applications', applicationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Atualizar uma aplicação
  async update(id: number, applicationData: any) {
    try {
      const response = await api.patch(`/applications/${id}`, applicationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Deletar uma aplicação
  async delete(id: number) {
    try {
      await api.delete(`/applications/${id}`);
    } catch (error) {
      throw error;
    }
  }
};
