import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import trajetService from "../services/trajetService";
import userService from "../services/userService";
import camionService from "../services/camionService";
import remorqueService from "../services/remorqueService";

const Trajets = () => {
  const [trajets, setTrajets] = useState([]);
  const [filteredTrajets, setFilteredTrajets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");
  const [chauffeurFilter, setChauffeurFilter] = useState("tous");

  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [trajetToDelete, setTrajetToDelete] = useState(null);

  // Données pour les selects
  const [chauffeurs, setChauffeurs] = useState([]);
  const [camions, setCamions] = useState([]);
  const [remorques, setRemorques] = useState([]);

  // Formulaire
  const [formData, setFormData] = useState({
    chauffeur: "",
    camion: "",
    remorque: "",
    lieuDepart: "",
    lieuArrivee: "",
    dateDepart: "",
    dateArrivee: "",
    distancePrevue: "",
    marchandise: "",
    poids: "",
    statut: "planifié",
    remarques: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchTrajets();
    fetchChauffeurs();
    fetchCamionsDisponibles();
    fetchRemorquesDisponibles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [trajets, searchTerm, statusFilter, chauffeurFilter]);

  const fetchTrajets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await trajetService.getAll();

      if (response && response.data) {
        setTrajets(
          Array.isArray(response.data.trajets) ? response.data.trajets : []
        );
      } else {
        setTrajets([]);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des trajets:", err);
      setError(
        err.response?.data?.message || "Erreur lors du chargement des trajets"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchChauffeurs = async () => {
    try {
      const response = await userService.getChauffeurs();
      if (response && response.data) {
        setChauffeurs(
          Array.isArray(response.data.chauffeurs)
            ? response.data.chauffeurs
            : []
        );
      }
    } catch (err) {
      console.error("Erreur lors du chargement des chauffeurs:", err);
    }
  };

  const fetchCamionsDisponibles = async () => {
    try {
      const response = await camionService.getDisponibles();
      if (response && response.data) {
        setCamions(
          Array.isArray(response.data.camions) ? response.data.camions : []
        );
      }
    } catch (err) {
      console.error("Erreur lors du chargement des camions:", err);
    }
  };

  const fetchRemorquesDisponibles = async () => {
    try {
      const response = await remorqueService.getDisponibles();
      if (response && response.data) {
        setRemorques(
          Array.isArray(response.data.remorques) ? response.data.remorques : []
        );
      }
    } catch (err) {
      console.error("Erreur lors du chargement des remorques:", err);
    }
  };

  const applyFilters = () => {
    let filtered = [...trajets];

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.lieuDepart?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.lieuArrivee?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== "tous") {
      filtered = filtered.filter((t) => t.statut === statusFilter);
    }

    // Filtre par chauffeur
    if (chauffeurFilter !== "tous") {
      filtered = filtered.filter((t) => t.chauffeur?._id === chauffeurFilter);
    }

    setFilteredTrajets(filtered);
  };

  const getStatusBadge = (statut) => {
    const badges = {
      planifié: "bg-blue-100 text-blue-800",
      en_cours: "bg-orange-100 text-orange-800",
      terminé: "bg-green-100 text-green-800",
      annulé: "bg-red-100 text-red-800",
    };

    const labels = {
      planifié: "Planifié",
      en_cours: "En cours",
      terminé: "Terminé",
      annulé: "Annulé",
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          badges[statut] || "bg-gray-100 text-gray-800"
        }`}
      >
        {labels[statut] || statut}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleOpenCreateModal = () => {
    setFormData({
      chauffeur: "",
      camion: "",
      remorque: "",
      lieuDepart: "",
      lieuArrivee: "",
      dateDepart: "",
      dateArrivee: "",
      distancePrevue: "",
      marchandise: "",
      poids: "",
      statut: "planifié",
      remarques: "",
    });
    setFormErrors({});
    setSuccessMessage("");
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setFormErrors({});
    setSuccessMessage("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.chauffeur) errors.chauffeur = "Le chauffeur est requis";
    if (!formData.camion) errors.camion = "Le camion est requis";
    if (!formData.remorque) errors.remorque = "La remorque est requise";
    if (!formData.lieuDepart.trim())
      errors.lieuDepart = "Le lieu de départ est requis";
    if (!formData.lieuArrivee.trim())
      errors.lieuArrivee = "Le lieu d'arrivée est requis";
    if (!formData.dateDepart)
      errors.dateDepart = "La date de départ est requise";
    if (!formData.dateArrivee)
      errors.dateArrivee = "La date d'arrivée est requise";
    if (!formData.distancePrevue || formData.distancePrevue <= 0) {
      errors.distancePrevue = "La distance doit être supérieure à 0";
    }
    if (!formData.marchandise.trim())
      errors.marchandise = "Le type de marchandise est requis";
    if (!formData.poids || formData.poids <= 0) {
      errors.poids = "Le poids doit être supérieur à 0";
    }

    // Vérifier que la date d'arrivée est après la date de départ
    if (formData.dateDepart && formData.dateArrivee) {
      const depart = new Date(formData.dateDepart);
      const arrivee = new Date(formData.dateArrivee);
      if (arrivee <= depart) {
        errors.dateArrivee =
          "La date d'arrivée doit être après la date de départ";
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      setFormErrors({});

      const dataToSend = {
        chauffeur: formData.chauffeur,
        camion: formData.camion,
        remorque: formData.remorque,
        lieuDepart: formData.lieuDepart,
        lieuArrivee: formData.lieuArrivee,
        dateDepart: formData.dateDepart,
        dateArrivee: formData.dateArrivee,
        distancePrevue: parseInt(formData.distancePrevue),
        marchandise: formData.marchandise,
        poids: parseInt(formData.poids),
        statut: formData.statut,
      };

      if (formData.remarques) {
        dataToSend.remarques = formData.remarques;
      }

      console.log("=== CRÉATION TRAJET ===");
      console.log("Données à envoyer:", dataToSend);
      console.log("======================");

      const response = await trajetService.create(dataToSend);

      if (response.success) {
        setSuccessMessage("Trajet créé avec succès !");
        await fetchTrajets();

        setTimeout(() => {
          handleCloseCreateModal();
        }, 1500);
      }
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      setFormErrors({
        submit:
          error.response?.data?.message ||
          "Erreur lors de la création du trajet",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (trajet) => {
    setTrajetToDelete(trajet);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setTrajetToDelete(null);
  };

  const handleDeleteTrajet = async () => {
    if (!trajetToDelete) return;

    try {
      setSubmitting(true);
      await trajetService.delete(trajetToDelete._id);

      setTrajets((prev) => prev.filter((t) => t._id !== trajetToDelete._id));
      handleCloseDeleteModal();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setFormErrors({
        submit:
          error.response?.data?.message || "Erreur lors de la suppression",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des trajets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestion des Trajets
            </h1>
            <p className="text-gray-600 mt-1">
              Planification et suivi des trajets
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nouveau trajet
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recherche */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher
            </label>
            <input
              type="text"
              placeholder="Lieu de départ ou arrivée..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtre par statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="tous">Tous</option>
              <option value="planifié">Planifié</option>
              <option value="en_cours">En cours</option>
              <option value="terminé">Terminé</option>
              <option value="annulé">Annulé</option>
            </select>
          </div>

          {/* Filtre par chauffeur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chauffeur
            </label>
            <select
              value={chauffeurFilter}
              onChange={(e) => setChauffeurFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="tous">Tous</option>
              {chauffeurs.map((chauffeur) => (
                <option key={chauffeur._id} value={chauffeur._id}>
                  {chauffeur.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredTrajets.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Aucun trajet trouvé
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par créer un nouveau trajet.
            </p>
            <div className="mt-6">
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg
                  className="w-5 h-5 mr-2"
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
                Nouveau trajet
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chauffeur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Véhicules
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Itinéraire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date départ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTrajets.map((trajet) => (
                  <tr key={trajet._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {trajet.chauffeur?.name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {trajet.chauffeur?.email || ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        🚛 {trajet.camion?.matricule || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        🚚 {trajet.remorque?.matricule || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <svg
                          className="w-4 h-4 mr-1 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {trajet.lieuDepart}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <svg
                          className="w-4 h-4 mr-1 text-red-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {trajet.lieuArrivee}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(trajet.dateDepart)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {trajet.distancePrevue} km
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(trajet.statut)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <Link
                          to={`/admin/trajets/${trajet._id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Détails"
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleOpenDeleteModal(trajet)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Nouveau trajet
              </h2>
              <button
                onClick={handleCloseCreateModal}
                disabled={submitting}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {successMessage && (
                <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <div className="flex">
                    <svg
                      className="h-5 w-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="ml-3 text-sm font-medium text-green-800">
                      {successMessage}
                    </p>
                  </div>
                </div>
              )}

              {formErrors.submit && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex">
                    <svg
                      className="h-5 w-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="ml-3 text-sm font-medium text-red-800">
                      {formErrors.submit}
                    </p>
                  </div>
                </div>
              )}

              {/* Section Transport */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Transport
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chauffeur <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="chauffeur"
                      value={formData.chauffeur}
                      onChange={handleInputChange}
                      disabled={submitting}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                        formErrors.chauffeur
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Sélectionner un chauffeur</option>
                      {chauffeurs.map((chauffeur) => (
                        <option key={chauffeur._id} value={chauffeur._id}>
                          {chauffeur.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.chauffeur && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.chauffeur}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Camion <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="camion"
                      value={formData.camion}
                      onChange={handleInputChange}
                      disabled={submitting}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                        formErrors.camion ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Sélectionner un camion</option>
                      {camions.map((camion) => (
                        <option key={camion._id} value={camion._id}>
                          {camion.matricule} - {camion.marque} {camion.modele}
                        </option>
                      ))}
                    </select>
                    {formErrors.camion && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.camion}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remorque <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="remorque"
                      value={formData.remorque}
                      onChange={handleInputChange}
                      disabled={submitting}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                        formErrors.remorque
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Sélectionner une remorque</option>
                      {remorques.map((remorque) => (
                        <option key={remorque._id} value={remorque._id}>
                          {remorque.matricule} - {remorque.type}
                        </option>
                      ))}
                    </select>
                    {formErrors.remorque && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.remorque}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section Itinéraire */}
              <div className="mb-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Itinéraire
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lieu de départ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lieuDepart"
                      value={formData.lieuDepart}
                      onChange={handleInputChange}
                      disabled={submitting}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                        formErrors.lieuDepart
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {formErrors.lieuDepart && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.lieuDepart}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lieu d'arrivée <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lieuArrivee"
                      value={formData.lieuArrivee}
                      onChange={handleInputChange}
                      disabled={submitting}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                        formErrors.lieuArrivee
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {formErrors.lieuArrivee && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.lieuArrivee}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date et heure de départ{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="dateDepart"
                      value={formData.dateDepart}
                      onChange={handleInputChange}
                      disabled={submitting}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                        formErrors.dateDepart
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {formErrors.dateDepart && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.dateDepart}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date et heure d'arrivée prévue{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="dateArrivee"
                      value={formData.dateArrivee}
                      onChange={handleInputChange}
                      disabled={submitting}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                        formErrors.dateArrivee
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {formErrors.dateArrivee && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.dateArrivee}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Distance prévue (km){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="distancePrevue"
                      value={formData.distancePrevue}
                      onChange={handleInputChange}
                      disabled={submitting}
                      min="1"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                        formErrors.distancePrevue
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {formErrors.distancePrevue && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.distancePrevue}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section Marchandise */}
              <div className="mb-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Marchandise
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de marchandise{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="marchandise"
                      value={formData.marchandise}
                      onChange={handleInputChange}
                      disabled={submitting}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                        formErrors.marchandise
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {formErrors.marchandise && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.marchandise}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Poids (kg) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="poids"
                      value={formData.poids}
                      onChange={handleInputChange}
                      disabled={submitting}
                      min="1"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                        formErrors.poids ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {formErrors.poids && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.poids}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section Suivi */}
              <div className="mb-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Suivi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statut
                    </label>
                    <select
                      name="statut"
                      value={formData.statut}
                      onChange={handleInputChange}
                      disabled={submitting}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    >
                      <option value="planifié">Planifié</option>
                      <option value="en_cours">En cours</option>
                      <option value="terminé">Terminé</option>
                      <option value="annulé">Annulé</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remarques
                    </label>
                    <textarea
                      name="remarques"
                      value={formData.remarques}
                      onChange={handleInputChange}
                      disabled={submitting}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Création...
                    </>
                  ) : (
                    "Créer le trajet"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {showDeleteModal && trajetToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
              Supprimer le trajet
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Êtes-vous sûr de vouloir supprimer le trajet de{" "}
              <strong>
                {trajetToDelete.lieuDepart} → {trajetToDelete.lieuArrivee}
              </strong>{" "}
              ? Cette action est irréversible.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={handleCloseDeleteModal}
                disabled={submitting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteTrajet}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trajets;
