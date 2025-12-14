import api from '../config/api';

const camionService = {
  // CRUD de base
  getAll: async () => {
    const response = await api.get('/camions');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/camions/${id}`);
    return response.data;
  },

  create: async (camionData) => {
    const response = await api.post('/camions', camionData);
    return response.data;
  },

  update: async (id, camionData) => {
    const response = await api.put(`/camions/${id}`, camionData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/camions/${id}`);
    return response.data;
  },

  // Routes spéciales
  getDisponibles: async () => {
    const response = await api.get('/camions/disponibles');
    return response.data;
  },
};

export default camionService;