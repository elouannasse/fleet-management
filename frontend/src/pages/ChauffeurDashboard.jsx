import { useAuth } from '../contexts/AuthContext';

const ChauffeurDashboard = () => {
  const { user } = useAuth();

  const chauffeurFeatures = [
    { title: 'Mes trajets assignés', description: 'Consulter les trajets qui vous sont assignés', icon: '🛣️' },
    { title: 'Mise à jour statut', description: 'Mettre à jour le statut de vos trajets en cours', icon: '📝' },
    { title: 'Véhicules disponibles', description: 'Consulter les véhicules disponibles', icon: '🚛' },
  ];

  const myStats = [
    { label: 'Trajets assignés', value: '3', color: 'bg-blue-500' },
    { label: 'Trajets terminés ce mois', value: '12', color: 'bg-green-500' },
    { label: 'Km parcourus', value: '2,450', color: 'bg-yellow-500' },
  ];

  const recentTrajets = [
    { id: 1, depart: 'Paris', arrivee: 'Lyon', statut: 'en_cours', date: '2024-01-15' },
    { id: 2, depart: 'Lyon', arrivee: 'Marseille', statut: 'planifie', date: '2024-01-16' },
    { id: 3, depart: 'Marseille', arrivee: 'Nice', statut: 'planifie', date: '2024-01-17' },
  ];

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'en_cours': return 'bg-blue-100 text-blue-800';
      case 'planifie': return 'bg-yellow-100 text-yellow-800';
      case 'termine': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Tableau de bord Chauffeur
        </h1>
        <p className="text-gray-600 mt-2">
          Bienvenue {user?.prenom} {user?.nom} - Gérez vos trajets
        </p>
      </div>

      {/* Statistiques personnelles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {myStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-full p-3 mr-4`}>
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mes trajets récents */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Mes trajets récents</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentTrajets.map((trajet) => (
                <div key={trajet.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {trajet.depart} → {trajet.arrivee}
                      </p>
                      <p className="text-sm text-gray-600">{trajet.date}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutColor(trajet.statut)}`}>
                      {trajet.statut.replace('_', ' ')}
                    </span>
                  </div>
                  {trajet.statut === 'en_cours' && (
                    <button className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                      Mettre à jour
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button className="mt-4 w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">
              Voir tous mes trajets
            </button>
          </div>
        </div>

        {/* Fonctionnalités disponibles */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Fonctionnalités disponibles
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {chauffeurFeatures.map((feature, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center mb-2">
                    <span className="text-xl mr-3">{feature.icon}</span>
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Actions rapides</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Démarrer trajet
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Terminer trajet
            </button>
            <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700">
              Signaler problème
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChauffeurDashboard;