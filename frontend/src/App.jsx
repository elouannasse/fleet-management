import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";

// Import des pages
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ChauffeurDashboard from "./pages/ChauffeurDashboard";
import NotFound from "./pages/NotFound";
import RegisterPage from "./pages/RegisterPage";
import Users from "./pages/Users";
import UserDetails from "./pages/UserDetails";
import Camions from "./pages/Camions";
import CamionDetails from "./pages/CamionDetails";
import Remorques from "./pages/Remorques";
import RemorqueDetails from "./pages/RemorqueDetails";
import Pneus from "./pages/Pneus";
import PneuDetails from "./pages/PneuDetails";
import Trajets from "./pages/Trajets";
import TrajetDetails from "./pages/TrajetDetails";

const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
      <p className="text-xl text-gray-600 mb-4">Accès non autorisé</p>
      <p className="text-sm text-gray-500">
        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
      </p>
    </div>
  </div>
);

const AppRoutes = () => {
  const { user, isAdmin, isChauffeur, loading } = useAuth();

  // Afficher un loader pendant le chargement initial
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  // Fonction pour rediriger selon le rôle
  const getDefaultRoute = () => {
    if (!user) return "/login";
    return user.role === "admin" ? "/admin/dashboard" : "/chauffeur/dashboard";
  };

  return (
    <Routes>
      {/* Routes publiques */}
      <Route
        path="/login"
        element={user ? <Navigate to={getDefaultRoute()} replace /> : <Login />}
      />
      <Route
        path="/register"
        element={
          user ? <Navigate to={getDefaultRoute()} replace /> : <RegisterPage />
        }
      />

      {/* Routes avec layout (sidebar) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="users/:id" element={<UserDetails />} />
        <Route path="camions" element={<Camions />} />
        <Route path="camions/:id" element={<CamionDetails />} />
        <Route path="remorques" element={<Remorques />} />
        <Route path="remorques/:id" element={<RemorqueDetails />} />
        <Route path="pneus" element={<Pneus />} />
        <Route path="pneus/:id" element={<PneuDetails />} />
        <Route path="trajets" element={<Trajets />} />
        <Route path="trajets/:id" element={<TrajetDetails />} />
        <Route
          path="maintenances"
          element={
            <div className="p-6">
              <h1 className="text-2xl font-bold">Gestion des Maintenances</h1>
              <p className="text-gray-600 mt-2">
                Page en cours de développement
              </p>
            </div>
          }
        />
        <Route
          path="rapports"
          element={
            <div className="p-6">
              <h1 className="text-2xl font-bold">Rapports</h1>
              <p className="text-gray-600 mt-2">
                Page en cours de développement
              </p>
            </div>
          }
        />
      </Route>

      <Route
        path="/chauffeur"
        element={
          <ProtectedRoute requireChauffeur>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<ChauffeurDashboard />} />
      </Route>

      {/* Pages d'erreur */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Redirection par défaut */}
      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
