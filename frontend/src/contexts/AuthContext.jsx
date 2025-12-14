import { createContext, useContext, useState, useEffect } from "react";
import api from "../config/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Vérifier si l'utilisateur est admin
  const isAdmin = () => user?.role === "admin";

  // Vérifier si l'utilisateur est chauffeur
  const isChauffeur = () => user?.role === "chauffeur";

  // Connexion
  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });

      // Structure API: { success: true, data: { token: "...", user: {...} }, message: "..." }
      if (response.data.success && response.data.data) {
        const { token: newToken, user: userData } = response.data.data;

        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        setLoading(false);

        return { success: true, user: userData };
      }

      throw new Error(response.data.message || "Réponse API invalide");
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Erreur de connexion",
      };
    }
  };

  // Inscription
  const register = async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Erreur d'inscription",
      };
    }
  };

  // Déconnexion
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // Vérifier le token au chargement
  useEffect(() => {
    const checkAuth = () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setToken(storedToken);
        } catch (error) {
          console.error("Erreur lors du chargement du user:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const value = {
    user,
    token,
    loading,
    isAdmin,
    isChauffeur,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
