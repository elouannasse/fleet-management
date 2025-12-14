import api from '../config/api';

const remorqueService = {
  // CRUD de base
  getAll: async () => {
    const response = await api.get('/remorques');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/remorques/${id}`);
    return response.data;
  },

  create: async (remorqueData) => {
    const response = await api.post('/remorques', remorqueData);
    return response.data;
  },

  update: async (id, remorqueData) => {
    const response = await api.put(`/remorques/${id}`, remorqueData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/remorques/${id}`);
    return response.data;
  },

  // Routes spéciales
  getDisponibles: async () => {
    const response = await api.get('/remorques/disponibles');
    return response.data;
  },
};

export default remorqueService;