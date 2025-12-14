import api from '../config/api';

const reportsService = {
  // Rapports avec paramètres de date
  getConsumption: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/reports/consumption?${params}`);
    return response.data;
  },

  getKilometrage: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/reports/kilometrage?${params}`);
    return response.data;
  },

  getMaintenance: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/reports/maintenance?${params}`);
    return response.data;
  },

  // Dashboard overview
  getDashboard: async () => {
    const response = await api.get('/reports/dashboard');
    return response.data;
  },

  // Rapport détaillé d'un véhicule
  getVehiculeDetails: async (vehiculeType, vehiculeId) => {
    const response = await api.get(`/reports/vehicule/${vehiculeType}/${vehiculeId}`);
    return response.data;
  },
};

export default reportsService;