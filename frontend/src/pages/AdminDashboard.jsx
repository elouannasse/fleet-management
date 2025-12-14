import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    camions: { total: 0, disponibles: 0, enMaintenance: 0 },
    trajets: { total: 0, enCours: 0, termines: 0 },
    maintenances: { total: 0, prevues: 0, enCours: 0 },
    remorques: { total: 0, disponibles: 0 },
  });
  const [recentTrajets, setRecentTrajets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [camionsRes, trajetsRes, maintenancesRes, remorquesRes] =
        await Promise.all([
          axios.get(`${API_URL}/camions`, config),
          axios.get(`${API_URL}/trajets`, config),
          axios.get(`${API_URL}/maintenances`, config),
          axios.get(`${API_URL}/remorques`, config),
        ]);

      const camionsData = camionsRes.data.data || [];
      const trajetsData = trajetsRes.data.data || [];
      const maintenancesData = maintenancesRes.data.data || [];
      const remorquesData = remorquesRes.data.data || [];

      setStats({
        camions: {
          total: camionsData.length,
          disponibles: camionsData.filter((c) => c.statut === "disponible")
            .length,
          enMaintenance: camionsData.filter(
            (c) => c.statut === "en_maintenance"
          ).length,
        },
        trajets: {
          total: trajetsData.length,
          enCours: trajetsData.filter((t) => t.statut === "en_cours").length,
          termines: trajetsData.filter((t) => t.statut === "termine").length,
        },
        maintenances: {
          total: maintenancesData.length,
          prevues: maintenancesData.filter((m) => m.statut === "prevue").length,
          enCours: maintenancesData.filter((m) => m.statut === "en_cours")
            .length,
        },
        remorques: {
          total: remorquesData.length,
          disponibles: remorquesData.filter((r) => r.statut === "disponible")
            .length,
        },
      });

      // Récupérer les 5 derniers trajets
      setRecentTrajets(trajetsData.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Tableau de bord Administrateur
        </h1>
        <p className="text-gray-600 mt-2">
          Bienvenue {user?.name} - Vue d'ensemble de la flotte
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Camions */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Camions</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.camions.total}
              </p>
              <div className="flex gap-3 mt-2">
                <span className="text-xs text-green-600">
                  ✓ {stats.camions.disponibles} disponibles
                </span>
                <span className="text-xs text-orange-600">
                  ⚠ {stats.camions.enMaintenance} maintenance
                </span>
              </div>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Trajets */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Trajets</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.trajets.total}
              </p>
              <div className="flex gap-3 mt-2">
                <span className="text-xs text-blue-600">
                  → {stats.trajets.enCours} en cours
                </span>
                <span className="text-xs text-green-600">
                  ✓ {stats.trajets.termines} terminés
                </span>
              </div>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Maintenances */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Maintenances</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.maintenances.total}
              </p>
              <div className="flex gap-3 mt-2">
                <span className="text-xs text-yellow-600">
                  ⏱ {stats.maintenances.prevues} prévues
                </span>
                <span className="text-xs text-orange-600">
                  🔧 {stats.maintenances.enCours} en cours
                </span>
              </div>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Remorques */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Remorques</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.remorques.total}
              </p>
              <div className="flex gap-3 mt-2">
                <span className="text-xs text-green-600">
                  ✓ {stats.remorques.disponibles} disponibles
                </span>
              </div>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <svg
                className="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Deux colonnes : Trajets récents et Actions rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trajets récents */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Trajets récents
            </h2>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Voir tout →
            </button>
          </div>
          <div className="p-6">
            {recentTrajets.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aucun trajet enregistré
              </p>
            ) : (
              <div className="space-y-4">
                {recentTrajets.map((trajet) => (
                  <div
                    key={trajet._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          trajet.statut === "en_cours"
                            ? "bg-blue-500"
                            : trajet.statut === "termine"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      ></div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {trajet.lieuDepart} → {trajet.lieuArrivee}
                        </p>
                        <p className="text-sm text-gray-500">
                          {trajet.chauffeur?.prenom} {trajet.chauffeur?.nom} •{" "}
                          {trajet.camion?.matricule}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          trajet.statut === "en_cours"
                            ? "bg-blue-100 text-blue-800"
                            : trajet.statut === "termine"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {trajet.statut === "en_cours"
                          ? "En cours"
                          : trajet.statut === "termine"
                          ? "Terminé"
                          : trajet.statut === "a_faire"
                          ? "À faire"
                          : trajet.statut}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Actions rapides
            </h2>
          </div>
          <div className="p-6 space-y-3">
            <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Nouveau trajet</span>
            </button>

            <button className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Ajouter camion</span>
            </button>

            <button className="w-full bg-yellow-600 text-white px-4 py-3 rounded-lg hover:bg-yellow-700 transition flex items-center justify-center space-x-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Planifier maintenance</span>
            </button>

            <button className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition flex items-center justify-center space-x-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Générer rapport</span>
            </button>

            <button
              onClick={fetchDashboardData}
              className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition flex items-center justify-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Actualiser</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
