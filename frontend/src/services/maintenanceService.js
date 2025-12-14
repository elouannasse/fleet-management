import api from '../config/api';

const maintenanceService = {
  // CRUD de base
  getAll: async () => {
    const response = await api.get('/maintenances');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/maintenances/${id}`);
    return response.data;
  },

  create: async (maintenanceData) => {
    const response = await api.post('/maintenances', maintenanceData);
    return response.data;
  },

  update: async (id, maintenanceData) => {
    const response = await api.put(`/maintenances/${id}`, maintenanceData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/maintenances/${id}`);
    return response.data;
  },

  // Routes spéciales
  getStats: async () => {
    const response = await api.get('/maintenances/stats');
    return response.data;
  },

  getByVehicule: async (vehiculeType, vehiculeId) => {
    const response = await api.get(`/maintenances/vehicule/${vehiculeType}/${vehiculeId}`);
    return response.data;
  },

  // Règles de maintenance
  getRules: async () => {
    const response = await api.get('/maintenance-rules');
    return response.data;
  },

  createRule: async (ruleData) => {
    const response = await api.post('/maintenance-rules', ruleData);
    return response.data;
  },

  updateRule: async (id, ruleData) => {
    const response = await api.put(`/maintenance-rules/${id}`, ruleData);
    return response.data;
  },

  deleteRule: async (id) => {
    const response = await api.delete(`/maintenance-rules/${id}`);
    return response.data;
  },
};

export default maintenanceService;