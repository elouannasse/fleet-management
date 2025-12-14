import api from "../config/api";

const userService = {
  // CRUD de base
  getAll: async () => {
    const response = await api.get("/users");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (userData) => {
    const response = await api.post("/users", userData);
    return response.data;
  },

  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Routes spéciales
  getChauffeurs: async () => {
    const response = await api.get("/users/chauffeurs");
    return response.data;
  },

  // Changer le statut actif/inactif
  updateStatus: async (id, isActive) => {
    const response = await api.put(`/users/${id}`, { isActive });
    return response.data;
  },

  // Réinitialiser le mot de passe
  resetPassword: async (id, newPassword) => {
    const response = await api.put(`/users/${id}`, { password: newPassword });
    return response.data;
  },
};

export default userService;
