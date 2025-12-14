import api from '../config/api';

const pneuService = {
  // CRUD de base
  getAll: async () => {
    const response = await api.get('/pneus');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/pneus/${id}`);
    return response.data;
  },

  create: async (pneuData) => {
    const response = await api.post('/pneus', pneuData);
    return response.data;
  },

  update: async (id, pneuData) => {
    const response = await api.put(`/pneus/${id}`, pneuData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/pneus/${id}`);
    return response.data;
  },

  // Routes spéciales
  getByVehicule: async (vehiculeType, vehiculeId) => {
    const response = await api.get(`/pneus/vehicule/${vehiculeType}/${vehiculeId}`);
    return response.data;
  },
};

export default pneuService;