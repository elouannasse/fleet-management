import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import pneuService from "../services/pneuService";
import camionService from "../services/camionService";
import remorqueService from "../services/remorqueService";

const Pneus = () => {
  const navigate = useNavigate();
  const [pneus, setPneus] = useState([]);
  const [filteredPneus, setFilteredPneus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");
  const [vehiculeTypeFilter, setVehiculeTypeFilter] = useState("tous");

  // Données pour le formulaire
  const [camions, setCamions] = useState([]);
  const [remorques, setRemorques] = useState([]);
  const [vehiculesDisponibles, setVehiculesDisponibles] = useState([]);

  const [formData, setFormData] = useState({
    reference: "",
    marque: "",
    modele: "",
    dimension: "",
    numeroSerie: "",
    vehiculeType: "Camion",
    vehicule: "",
    position: "avant-droit",
    kilometrageInstallation: 0,
    pressionRecommandee: 8.5,
    dateAchat: "",
    prixAchat: "",
    statut: "en service",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // States pour la suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pneuToDelete, setPneuToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [pneus, searchTerm, statusFilter, vehiculeTypeFilter]);

  useEffect(() => {
    // Charger les véhicules disponibles selon le type sélectionné
    if (formData.vehiculeType === "Camion") {
      setVehiculesDisponibles(camions);
    } else {
      setVehiculesDisponibles(remorques);
    }
    setFormData((prev) => ({ ...prev, vehicule: "" }));
  }, [formData.vehiculeType, camions, remorques]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [pneusRes, camionsRes, remorquesRes] = await Promise.all([
        pneuService.getAll(),
        camionService.getAll(),
        remorqueService.getAll(),
      ]);

      // Pneus
      if (pneusRes && pneusRes.data && pneusRes.data.pneus) {
        setPneus(Array.isArray(pneusRes.data.pneus) ? pneusRes.data.pneus : []);
      } else {
        setPneus([]);
      }

      // Camions
      if (camionsRes && camionsRes.data && camionsRes.data.camions) {
        setCamions(
          Array.isArray(camionsRes.data.camions) ? camionsRes.data.camions : []
        );
      } else {
        setCamions([]);
      }

      // Remorques
      if (remorquesRes && remorquesRes.data && remorquesRes.data.remorques) {
        setRemorques(
          Array.isArray(remorquesRes.data.remorques)
            ? remorquesRes.data.remorques
            : []
        );
      } else {
        setRemorques([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      setError(
        error.response?.data?.message || "Erreur lors du chargement des données"
      );
      setPneus([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...pneus];

    // Filtre par recherche (référence ou marque)
    if (searchTerm) {
      filtered = filtered.filter(
        (pneu) =>
          pneu.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pneu.marque?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== "tous") {
      filtered = filtered.filter((pneu) => pneu.statut === statusFilter);
    }

    // Filtre par type de véhicule
    if (vehiculeTypeFilter !== "tous") {
      filtered = filtered.filter(
        (pneu) => pneu.vehiculeType === vehiculeTypeFilter
      );
    }

    setFilteredPneus(filtered);
  };

  const getStatutColor = (statut) => {
    const colors = {
      "en service": "bg-green-100 text-green-800",
      retiré: "bg-red-100 text-red-800",
      "en stock": "bg-blue-100 text-blue-800",
    };
    return colors[statut] || "bg-gray-100 text-gray-800";
  };

  const getEtatColor = (etat) => {
    const colors = {
      neuf: "bg-green-100 text-green-800",
      bon: "bg-blue-100 text-blue-800",
      usé: "bg-orange-100 text-orange-800",
      "à remplacer": "bg-red-100 text-red-800",
    };
    return colors[etat] || "bg-gray-100 text-gray-800";
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

    if (!formData.reference.trim()) {
      errors.reference = "La référence est requise";
    }

    if (!formData.marque.trim()) {
      errors.marque = "La marque est requise";
    }

    if (!formData.modele.trim()) {
      errors.modele = "Le modèle est requis";
    }

    if (!formData.dimension.trim()) {
      errors.dimension = "La dimension est requise";
    }

    if (!formData.numeroSerie.trim()) {
      errors.numeroSerie = "Le numéro de série est requis";
    }

    if (!formData.vehicule) {
      errors.vehicule = "Le véhicule est requis";
    }

    if (!formData.dateAchat) {
      errors.dateAchat = "La date d'achat est requise";
    }

    if (!formData.prixAchat || formData.prixAchat <= 0) {
      errors.prixAchat = "Le prix d'achat doit être supérieur à 0";
    }

    if (!formData.pressionRecommandee || formData.pressionRecommandee <= 0) {
      errors.pressionRecommandee =
        "La pression recommandée doit être supérieure à 0";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      reference: "",
      marque: "",
      modele: "",
      dimension: "",
      numeroSerie: "",
      vehiculeType: "Camion",
      vehicule: "",
      position: "avant-droit",
      kilometrageInstallation: 0,
      pressionRecommandee: 8.5,
      dateAchat: "",
      prixAchat: "",
      statut: "en service",
    });
    setFormErrors({});
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const pneuData = {
        ...formData,
        kilometrageInstallation:
          parseInt(formData.kilometrageInstallation) || 0,
        pressionRecommandee: parseFloat(formData.pressionRecommandee),
        prixAchat: parseFloat(formData.prixAchat),
      };

      const response = await pneuService.create(pneuData);

      if (response.success && response.data && response.data.pneu) {
        setPneus((prev) => [response.data.pneu, ...prev]);
        setSuccessMessage("Pneu créé avec succès !");

        setTimeout(() => {
          setShowModal(false);
          resetForm();
        }, 1500);
      }
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      setFormErrors({
        submit:
          error.response?.data?.message || "Erreur lors de la création du pneu",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    if (!submitting) {
      setShowModal(false);
      resetForm();
    }
  };

  const handleOpenDeleteModal = (pneu) => {
    setPneuToDelete(pneu);
    setDeleteError("");
    setDeleteSuccess("");
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    if (!deleting) {
      setShowDeleteModal(false);
      setPneuToDelete(null);
      setDeleteError("");
      setDeleteSuccess("");
    }
  };

  const handleDeletePneu = async () => {
    if (!pneuToDelete) return;

    try {
      setDeleting(true);
      setDeleteError("");

      await pneuService.delete(pneuToDelete._id);

      setPneus((prev) => prev.filter((p) => p._id !== pneuToDelete._id));
      setDeleteSuccess("Pneu supprimé avec succès");

      setTimeout(() => {
        handleCloseDeleteModal();
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setDeleteError(
        error.response?.data?.message || "Erreur lors de la suppression du pneu"
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des pneus...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
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
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erreur</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={fetchAllData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Pneus</h1>
        <p className="text-gray-600 mt-2">
          Suivi et gestion des pneus de la flotte
        </p>
      </div>

      {/* Bouton + Filtres */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <button
          onClick={openModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center w-fit"
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
          Nouveau pneu
        </button>

        {/* Filtres */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Recherche */}
          <input
            type="text"
            placeholder="Rechercher par référence ou marque..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Filtre statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="tous">Tous les statuts</option>
            <option value="en service">En service</option>
            <option value="retiré">Retiré</option>
            <option value="en stock">En stock</option>
          </select>

          {/* Filtre type véhicule */}
          <select
            value={vehiculeTypeFilter}
            onChange={(e) => setVehiculeTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="tous">Tous les véhicules</option>
            <option value="Camion">Camion</option>
            <option value="Remorque">Remorque</option>
          </select>
        </div>
      </div>

      {/* Tableau des pneus */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marque/Modèle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dimension
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Véhicule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  État
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPneus.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-12 text-center text-gray-500"
                  >
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="mt-2 text-sm">Aucun pneu trouvé</p>
                    <button
                      onClick={openModal}
                      className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      + Créer votre premier pneu
                    </button>
                  </td>
                </tr>
              ) : (
                filteredPneus.map((pneu) => {
                  const pneuId = pneu._id || pneu.id;
                  return (
                    <tr
                      key={pneuId}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/admin/pneus/${pneuId}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {pneu.reference}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {pneu.marque}
                        </div>
                        <div className="text-sm text-gray-500">
                          {pneu.modele}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {pneu.dimension || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {pneu.vehicule?.matricule || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {pneu.vehiculeType}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 capitalize">
                          {pneu.position?.replace(/-/g, " ") || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutColor(
                            pneu.statut
                          )}`}
                        >
                          {pneu.statut || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getEtatColor(
                            pneu.etat
                          )}`}
                        >
                          {pneu.etat || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/pneus/${pneuId}`);
                          }}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Détails
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeleteModal(pneu);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de création */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Nouveau Pneu</h2>
              <button
                onClick={closeModal}
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
                <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded">
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
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Référence */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Référence <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="reference"
                    value={formData.reference}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                      formErrors.reference
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Ex: MICH-XZE-001"
                  />
                  {formErrors.reference && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.reference}
                    </p>
                  )}
                </div>

                {/* Marque */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marque <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="marque"
                    value={formData.marque}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                      formErrors.marque ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Ex: Michelin"
                  />
                  {formErrors.marque && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.marque}
                    </p>
                  )}
                </div>

                {/* Modèle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modèle <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="modele"
                    value={formData.modele}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                      formErrors.modele ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Ex: XZE"
                  />
                  {formErrors.modele && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.modele}
                    </p>
                  )}
                </div>

                {/* Dimension */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dimension <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="dimension"
                    value={formData.dimension}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                      formErrors.dimension
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Ex: 315/80R22.5"
                  />
                  {formErrors.dimension && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.dimension}
                    </p>
                  )}
                </div>

                {/* Numéro de série */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de série <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="numeroSerie"
                    value={formData.numeroSerie}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                      formErrors.numeroSerie
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Ex: MIC123456"
                  />
                  {formErrors.numeroSerie && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.numeroSerie}
                    </p>
                  )}
                </div>

                {/* Type de véhicule */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de véhicule
                  </label>
                  <select
                    name="vehiculeType"
                    value={formData.vehiculeType}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="Camion">Camion</option>
                    <option value="Remorque">Remorque</option>
                  </select>
                </div>

                {/* Véhicule */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Véhicule <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="vehicule"
                    value={formData.vehicule}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                      formErrors.vehicule ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Sélectionner un véhicule</option>
                    {vehiculesDisponibles.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.matricule} - {v.marque}
                      </option>
                    ))}
                  </select>
                  {formErrors.vehicule && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.vehicule}
                    </p>
                  )}
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="avant-droit">Avant droit</option>
                    <option value="avant-gauche">Avant gauche</option>
                    <option value="arriere-droit-exterieur">
                      Arrière droit extérieur
                    </option>
                    <option value="arriere-droit-interieur">
                      Arrière droit intérieur
                    </option>
                    <option value="arriere-gauche-exterieur">
                      Arrière gauche extérieur
                    </option>
                    <option value="arriere-gauche-interieur">
                      Arrière gauche intérieur
                    </option>
                  </select>
                </div>

                {/* Kilométrage installation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kilométrage installation (km)
                  </label>
                  <input
                    type="number"
                    name="kilometrageInstallation"
                    value={formData.kilometrageInstallation}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="0"
                    min="0"
                  />
                </div>

                {/* Pression recommandée */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pression recommandée (bars){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="pressionRecommandee"
                    value={formData.pressionRecommandee}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                      formErrors.pressionRecommandee
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="8.5"
                    min="0"
                  />
                  {formErrors.pressionRecommandee && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.pressionRecommandee}
                    </p>
                  )}
                </div>

                {/* Date d'achat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'achat <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateAchat"
                    value={formData.dateAchat}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                      formErrors.dateAchat
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formErrors.dateAchat && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.dateAchat}
                    </p>
                  )}
                </div>

                {/* Prix d'achat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix d'achat (€) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="prixAchat"
                    value={formData.prixAchat}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                      formErrors.prixAchat
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="350.00"
                    min="0"
                  />
                  {formErrors.prixAchat && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.prixAchat}
                    </p>
                  )}
                </div>

                {/* Statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <select
                    name="statut"
                    value={formData.statut}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="en service">En service</option>
                    <option value="retiré">Retiré</option>
                    <option value="en stock">En stock</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {submitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Création en cours...
                    </>
                  ) : (
                    "Créer le pneu"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {showDeleteModal && pneuToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-red-600"
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
                <h3 className="ml-3 text-lg font-medium text-gray-900">
                  Confirmer la suppression
                </h3>
              </div>
            </div>

            <div className="px-6 py-4">
              {deleteSuccess && (
                <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded">
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
                      {deleteSuccess}
                    </p>
                  </div>
                </div>
              )}

              {deleteError && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
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
                      {deleteError}
                    </p>
                  </div>
                </div>
              )}

              {!deleteSuccess && (
                <div className="text-sm text-gray-500">
                  <p className="mb-2">
                    Êtes-vous sûr de vouloir supprimer le pneu{" "}
                    <span className="font-semibold text-gray-900">
                      {pneuToDelete.reference}
                    </span>{" "}
                    ?
                  </p>
                  <p className="text-red-600 font-medium">
                    Cette action est irréversible.
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
              <button
                onClick={handleCloseDeleteModal}
                disabled={deleting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={handleDeletePneu}
                disabled={deleting || deleteSuccess}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {deleting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Suppression...
                  </>
                ) : (
                  "Supprimer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pneus;
