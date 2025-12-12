import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages temporaires pour la structure
const LoginPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full space-y-8">
      <h2 className="text-3xl font-bold text-center">Connexion</h2>
      <p className="text-center text-gray-600">Page de connexion à implémenter</p>
    </div>
  </div>
);

const RegisterPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full space-y-8">
      <h2 className="text-3xl font-bold text-center">Inscription</h2>
      <p className="text-center text-gray-600">Page d'inscription à implémenter</p>
    </div>
  </div>
);

const DashboardPage = () => {
  const { user, logout, isAdmin, isChauffeur } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Fleet Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.prenom} {user?.nom} ({user?.role})
              </span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8">
            <h2 className="text-2xl font-bold mb-4">
              Tableau de bord {isAdmin() ? 'Administrateur' : 'Chauffeur'}
            </h2>
            
            {isAdmin() && (
              <div className="space-y-2">
                <p>✅ Accès admin - Gestion complète</p>
                <p>• Gestion des utilisateurs</p>
                <p>• Gestion des véhicules</p>
                <p>• Gestion des trajets</p>
                <p>• Rapports et statistiques</p>
              </div>
            )}
            
            {isChauffeur() && (
              <div className="space-y-2">
                <p>✅ Accès chauffeur - Vue limitée</p>
                <p>• Mes trajets assignés</p>
                <p>• Mise à jour statut trajets</p>
                <p>• Consultation véhicules</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const AdminPage = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <h1 className="text-3xl font-bold mb-4">Administration</h1>
    <p>Page réservée aux administrateurs</p>
  </div>
);

const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
      <p className="text-xl text-gray-600">Accès non autorisé</p>
    </div>
  </div>
);

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Routes publiques */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} 
      />
      
      {/* Routes protégées */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      
      {/* Routes admin uniquement */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      
      {/* Pages d'erreur */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      
      {/* Redirection par défaut */}
      <Route 
        path="/" 
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
      />
      
      {/* 404 */}
      <Route 
        path="*" 
        element={
          <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-4xl font-bold">404 - Page non trouvée</h1>
          </div>
        } 
      />
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