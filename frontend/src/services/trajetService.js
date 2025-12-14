import api from '../config/api';

const trajetService = {
  // CRUD de base
  getAll: async () => {
    const response = await api.get('/trajets');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/trajets/${id}`);
    return response.data;
  },

  create: async (trajetData) => {
    const response = await api.post('/trajets', trajetData);
    return response.data;
  },

  update: async (id, trajetData) => {
    const response = await api.put(`/trajets/${id}`, trajetData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/trajets/${id}`);
    return response.data;
  },

  // Routes spéciales
  getMesTrajets: async () => {
    const response = await api.get('/trajets/mes-trajets');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/trajets/stats');
    return response.data;
  },

  updateStatus: async (id, statusData) => {
    const response = await api.patch(`/trajets/${id}/status`, statusData);
    return response.data;
  },

  generatePDF: async (id) => {
    const response = await api.get(`/trajets/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },
};

export default trajetService;