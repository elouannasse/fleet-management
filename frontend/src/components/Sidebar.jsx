import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user, logout, isAdmin, isChauffeur } = useAuth();
  const location = useLocation();

  const adminMenuItems = [
    { path: '/dashboard', label: 'Dashboard Admin', icon: '' },
    { path: '/users', label: 'Utilisateurs', icon: '' },
    { path: '/camions', label: 'Camions', icon: '' },
    { path: '/remorques', label: 'Remorques', icon: '' },
    { path: '/pneus', label: 'Pneus', icon: '' },
    { path: '/trajets', label: 'Trajets', icon: '' },
    { path: '/maintenances', label: 'Maintenances', icon: '' },
    { path: '/reports', label: 'Rapports', icon: '' },
  ];

  const chauffeurMenuItems = [
    { path: '/dashboard', label: 'Dashboard Chauffeur', icon: '' },
    { path: '/mes-trajets', label: 'Mes Trajets', icon: '' },
    { path: '/vehicules-disponibles', label: 'Véhicules disponibles', icon: '' },
  ];

  const menuItems = isAdmin() ? adminMenuItems : chauffeurMenuItems;

  const isActive = (path) => location.pathname === path;

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen flex flex-col">
      {/* Header avec nom utilisateur */}
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold mb-2">Fleet Management</h2>
        <div className="text-sm text-gray-300">
          <p className="font-medium">{user?.prenom} {user?.nom}</p>
          <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
        </div>
      </div>

      {/* Menu de navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bouton déconnexion */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-3 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors duration-200"
        >
          <span className="mr-3 text-lg">🚪</span>
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;