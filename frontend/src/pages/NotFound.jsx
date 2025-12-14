import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NotFound = () => {
  const { user, isAdmin } = useAuth();

  const getHomeLink = () => {
    if (!user) return '/login';
    return isAdmin() ? '/admin/dashboard' : '/chauffeur/dashboard';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Page non trouvée
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to={getHomeLink()}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </Link>
          
          {user && (
            <div className="text-sm text-gray-500">
              Connecté en tant que {user.prenom} {user.nom} ({user.role})
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;