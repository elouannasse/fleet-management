import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import camionService from "../services/camionService";

const Camions = () => {
  const navigate = useNavigate();
  const [camions, setCamions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    matricule: "",
    marque: "",
    modele: "",
    annee: "",
    kilometrage: "",
    capaciteCharge: "",
    typeCarburant: "diesel",
    statut: "disponible",
    dateAcquisition: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // States pour la suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [camionToDelete, setCamionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");

  useEffect(() => {
    fetchCamions();
  }, []);

  const fetchCamions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await camionService.getAll();

      // Gestion robuste de la réponse
      if (response && response.data && response.data.camions) {
        setCamions(
          Array.isArray(response.data.camions) ? response.data.camions : []
        );
      } else {
        setCamions([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des camions:", error);
      setError(
        error.response?.data?.message || "Erreur lors du chargement des camions"
      );
      setCamions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statut) => {
    const colors = {
      disponible: "bg-green-100 text-green-800",
      en_mission: "bg-blue-100 text-blue-800",
      en_maintenance: "bg-yellow-100 text-yellow-800",
      hors_service: "bg-red-100 text-red-800",
    };
    return colors[statut] || "bg-gray-100 text-gray-800";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Effacer l'erreur du champ modifié
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.matricule.trim()) {
      errors.matricule = "Le matricule est requis";
    }

    if (!formData.marque.trim()) {
      errors.marque = "La marque est requise";
    }

    if (!formData.modele.trim()) {
      errors.modele = "Le modèle est requis";
    }

    if (!formData.annee) {
      errors.annee = "L'année est requise";
    } else if (
      formData.annee < 1900 ||
      formData.annee > new Date().getFullYear() + 1
    ) {
      errors.annee = "L'année n'est pas valide";
    }

    if (!formData.kilometrage) {
      errors.kilometrage = "Le kilométrage est requis";
    } else if (formData.kilometrage < 0) {
      errors.kilometrage = "Le kilométrage ne peut pas être négatif";
    }

    if (!formData.capaciteCharge) {
      errors.capaciteCharge = "La capacité de charge est requise";
    } else if (formData.capaciteCharge <= 0) {
      errors.capaciteCharge = "La capacité de charge doit être positive";
    }

    if (!formData.dateAcquisition) {
      errors.dateAcquisition = "La date d'acquisition est requise";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      matricule: "",
      marque: "",
      modele: "",
      annee: "",
      kilometrage: "",
      capaciteCharge: "",
      typeCarburant: "diesel",
      statut: "disponible",
      dateAcquisition: "",
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

      // Convertir les valeurs numériques
      const camionData = {
        ...formData,
        annee: parseInt(formData.annee),
        kilometrage: parseFloat(formData.kilometrage),
        capaciteCharge: parseFloat(formData.capaciteCharge),
      };

      const response = await camionService.create(camionData);

      if (response.success && response.data && response.data.camion) {
        // Ajouter le nouveau camion à la liste
        setCamions((prev) => [response.data.camion, ...prev]);

        // Afficher le message de succès
        setSuccessMessage("Camion créé avec succès !");

        // Réinitialiser et fermer le modal après un court délai
        setTimeout(() => {
          setShowModal(false);
          resetForm();
        }, 1500);
      }
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      setFormErrors({
        submit:
          error.response?.data?.message ||
          "Erreur lors de la création du camion",
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

  // Ouvrir le modal de confirmation de suppression
  const handleOpenDeleteModal = (camion) => {
    setCamionToDelete(camion);
    setDeleteError("");
    setDeleteSuccess("");
    setShowDeleteModal(true);
  };

  // Fermer le modal de suppression
  const handleCloseDeleteModal = () => {
    if (!deleting) {
      setShowDeleteModal(false);
      setCamionToDelete(null);
      setDeleteError("");
      setDeleteSuccess("");
    }
  };

  // Supprimer le camion
  const handleDeleteCamion = async () => {
    if (!camionToDelete) return;

    try {
      setDeleting(true);
      setDeleteError("");

      await camionService.delete(camionToDelete._id);

      // Retirer le camion de la liste
      setCamions((prev) => prev.filter((c) => c._id !== camionToDelete._id));

      // Afficher le message de succès
      setDeleteSuccess("Camion supprimé avec succès");

      // Fermer le modal après un court délai
      setTimeout(() => {
        handleCloseDeleteModal();
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setDeleteError(
        error.response?.data?.message ||
          "Erreur lors de la suppression du camion"
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
          <p className="text-gray-600">Chargement des camions...</p>
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
          onClick={fetchCamions}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestion des Camions
        </h1>
        <p className="text-gray-600 mt-2">
          Liste de tous les camions de la flotte
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <button
            onClick={openModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Nouveau camion
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Matricule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Marque/Modèle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Année
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Kilométrage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {camions.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Aucun camion trouvé
                  </td>
                </tr>
              ) : (
                camions.map((camion) => {
                  // Sécurité: vérifier que camion existe et a les propriétés nécessaires
                  if (!camion || (!camion._id && !camion.id)) {
                    return null;
                  }

                  const camionId = camion._id || camion.id;

                  return (
                    <tr
                      key={camionId}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/admin/camions/${camionId}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {camion.matricule || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">
                          {camion.marque || ""} {camion.modele || ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-500">
                          {camion.annee || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-500">
                          {camion.kilometrage
                            ? `${camion.kilometrage.toLocaleString()} km`
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            camion.statut
                          )}`}
                        >
                          {camion.statut
                            ? camion.statut.replace("_", " ")
                            : "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/camions/${camionId}`);
                          }}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Détails
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeleteModal(camion);
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* En-tête du modal */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                Nouveau Camion
              </h2>
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

            {/* Message de succès */}
            {successMessage && (
              <div className="mx-6 mt-4 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm font-medium text-green-800">
                    {successMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Message d'erreur général */}
            {formErrors.submit && (
              <div className="mx-6 mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-sm text-red-700">{formErrors.submit}</p>
              </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matricule */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Matricule <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="matricule"
                    value={formData.matricule}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                      formErrors.matricule
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Ex: 123-TU-4575"
                  />
                  {formErrors.matricule && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.matricule}
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
                    placeholder="Ex: Mercedes"
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
                    placeholder="Ex: Actros"
                  />
                  {formErrors.modele && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.modele}
                    </p>
                  )}
                </div>

                {/* Année */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Année <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="annee"
                    value={formData.annee}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                      formErrors.annee ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Ex: 2023"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                  {formErrors.annee && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.annee}
                    </p>
                  )}
                </div>

                {/* Kilométrage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kilométrage (km) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="kilometrage"
                    value={formData.kilometrage}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                      formErrors.kilometrage
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Ex: 50000"
                    min="0"
                  />
                  {formErrors.kilometrage && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.kilometrage}
                    </p>
                  )}
                </div>

                {/* Capacité de charge */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacité de charge (kg){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="capaciteCharge"
                    value={formData.capaciteCharge}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                      formErrors.capaciteCharge
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Ex: 25000"
                    min="1"
                  />
                  {formErrors.capaciteCharge && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.capaciteCharge}
                    </p>
                  )}
                </div>

                {/* Type de carburant */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de carburant <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="typeCarburant"
                    value={formData.typeCarburant}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="diesel">Diesel</option>
                    <option value="essence">Essence</option>
                    <option value="electrique">Électrique</option>
                    <option value="hybride">Hybride</option>
                  </select>
                </div>

                {/* Statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="statut"
                    value={formData.statut}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="en_mission">En mission</option>
                    <option value="en_maintenance">En maintenance</option>
                    <option value="hors_service">Hors service</option>
                  </select>
                </div>

                {/* Date d'acquisition */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'acquisition <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateAcquisition"
                    value={formData.dateAcquisition}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                      formErrors.dateAcquisition
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formErrors.dateAcquisition && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.dateAcquisition}
                    </p>
                  )}
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
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
                        className="animate-spin h-4 w-4 mr-2"
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
                    "Créer le camion"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && camionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Header du modal */}
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

            {/* Corps du modal */}
            <div className="px-6 py-4">
              {/* Message de succès */}
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

              {/* Message d'erreur */}
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
                    Êtes-vous sûr de vouloir supprimer le camion{" "}
                    <span className="font-semibold text-gray-900">
                      {camionToDelete.matricule}
                    </span>{" "}
                    ?
                  </p>
                  <p className="text-red-600 font-medium">
                    Cette action est irréversible.
                  </p>
                </div>
              )}
            </div>

            {/* Footer du modal */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
              <button
                onClick={handleCloseDeleteModal}
                disabled={deleting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteCamion}
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

export default Camions;
