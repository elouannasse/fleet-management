import api from "../config/api";

class AuthService {
  async login(email, password) {
    try {
      const response = await api.post("/auth/login", { email, password });

      // Response structure from API: { success: true, token: "...", user: {...} }
      if (response.data.success && response.data.token && response.data.user) {
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        return { success: true, token, user };
      }

      throw new Error(response.data.message || "Login failed");
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  }

  async register(userData) {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  }

  async getMe() {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated() {
    return !!localStorage.getItem("token");
  }
}

export default new AuthService();
