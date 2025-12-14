import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import pneuService from "../services/pneuService";
import camionService from "../services/camionService";
import remorqueService from "../services/remorqueService";

const PneuDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pneu, setPneu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Données pour le formulaire de modification
  const [camions, setCamions] = useState([]);
  const [remorques, setRemorques] = useState([]);
  const [vehiculesDisponibles, setVehiculesDisponibles] = useState([]);

  // States pour le modal de modification
  const [showEditModal, setShowEditModal] = useState(false);
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

  useEffect(() => {
    fetchPneuDetails();
  }, [id]);

  useEffect(() => {
    // Charger les véhicules disponibles selon le type sélectionné
    if (formData.vehiculeType === "Camion") {
      setVehiculesDisponibles(camions);
    } else {
      setVehiculesDisponibles(remorques);
    }
  }, [formData.vehiculeType, camions, remorques]);

  const fetchPneuDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        setError("ID du pneu manquant");
        setLoading(false);
        return;
      }

      const [pneuRes, camionsRes, remorquesRes] = await Promise.all([
        pneuService.getById(id),
        camionService.getAll(),
        remorqueService.getAll(),
      ]);

      if (pneuRes && pneuRes.data && pneuRes.data.pneu) {
        setPneu(pneuRes.data.pneu);
      } else {
        setError("Pneu non trouvé");
      }

      // Camions
      if (camionsRes && camionsRes.data && camionsRes.data.camions) {
        setCamions(
          Array.isArray(camionsRes.data.camions) ? camionsRes.data.camions : []
        );
      }

      // Remorques
      if (remorquesRes && remorquesRes.data && remorquesRes.data.remorques) {
        setRemorques(
          Array.isArray(remorquesRes.data.remorques)
            ? remorquesRes.data.remorques
            : []
        );
      }
    } catch (err) {
      console.error("Erreur lors du chargement du pneu:", err);
      setError(
        err.response?.data?.message || "Erreur lors du chargement du pneu"
      );
    } finally {
      setLoading(false);
    }
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

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleOpenEditModal = () => {
    if (pneu) {
      setFormData({
        reference: pneu.reference || "",
        marque: pneu.marque || "",
        modele: pneu.modele || "",
        dimension: pneu.dimension || "",
        numeroSerie: pneu.numeroSerie || "",
        vehiculeType: pneu.vehiculeType || "Camion",
        vehicule: pneu.vehicule?._id || "",
        position: pneu.position || "avant-droit",
        kilometrageInstallation: pneu.kilometrageInstallation || 0,
        pressionRecommandee: pneu.pressionRecommandee || 8.5,
        dateAchat: formatDateForInput(pneu.dateAchat),
        prixAchat: pneu.prixAchat || "",
        statut: pneu.statut || "en service",
      });
      setFormErrors({});
      setSuccessMessage("");
      setShowEditModal(true);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
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

    if (!formData.prixAchat || formData.prixAchat <= 0) {
      errors.prixAchat = "Le prix d'achat doit être supérieur à 0";
    }

    if (!formData.pressionRecommandee || formData.pressionRecommandee <= 0) {
      errors.pressionRecommandee =
        "La pression recommandée doit être supérieure à 0";
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
        ...formData,
        kilometrageInstallation:
          parseInt(formData.kilometrageInstallation) || 0,
        pressionRecommandee: parseFloat(formData.pressionRecommandee),
        prixAchat: parseFloat(formData.prixAchat),
      };

      const response = await pneuService.update(id, dataToSend);

      if (response.data && response.data.pneu) {
        setPneu(response.data.pneu);
        setSuccessMessage("Pneu modifié avec succès !");

        setTimeout(() => {
          handleCloseEditModal();
        }, 1500);
      }
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      setFormErrors({
        submit:
          error.response?.data?.message ||
          "Erreur lors de la modification du pneu",
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
          <p className="text-gray-600">Chargement des détails du pneu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
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
          onClick={() => navigate("/admin/pneus")}
          className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          ← Retour à la liste
        </button>
      </div>
    );
  }

  if (!pneu) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Pneu non trouvé</p>
        <button
          onClick={() => navigate("/admin/pneus")}
          className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          ← Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/admin/pneus")}
            className="text-gray-600 hover:text-gray-900"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Pneu {pneu.reference}
            </h1>
            <p className="text-gray-600 mt-1">
              {pneu.marque} {pneu.modele}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleOpenEditModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Modifier
          </button>
        </div>
      </div>

      {/* Statut et État Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Statut</p>
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatutColor(
                pneu.statut
              )}`}
            >
              {pneu.statut?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">État</p>
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getEtatColor(
                pneu.etat
              )}`}
            >
              {pneu.etat?.toUpperCase() || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Détails */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations générales */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informations générales
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Référence</dt>
              <dd className="text-base font-medium text-gray-900">
                {pneu.reference}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Marque</dt>
              <dd className="text-base font-medium text-gray-900">
                {pneu.marque}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Modèle</dt>
              <dd className="text-base font-medium text-gray-900">
                {pneu.modele}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Dimension</dt>
              <dd className="text-base font-medium text-gray-900">
                {pneu.dimension}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Numéro de série</dt>
              <dd className="text-base font-medium text-gray-900">
                {pneu.numeroSerie}
              </dd>
            </div>
          </dl>
        </div>

        {/* Véhicule */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Véhicule</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Type</dt>
              <dd className="text-base font-medium text-gray-900">
                {pneu.vehiculeType}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Matricule</dt>
              <dd className="text-base font-medium text-gray-900">
                {pneu.vehicule?.matricule || "N/A"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Position</dt>
              <dd className="text-base font-medium text-gray-900 capitalize">
                {pneu.position?.replace(/-/g, " ") || "N/A"}
              </dd>
            </div>
          </dl>
        </div>

        {/* État */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            État et maintenance
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Pression recommandée</dt>
              <dd className="text-base font-medium text-gray-900">
                {pneu.pressionRecommandee} bars
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">
                Kilométrage installation
              </dt>
              <dd className="text-base font-medium text-gray-900">
                {pneu.kilometrageInstallation?.toLocaleString()} km
              </dd>
            </div>
          </dl>
        </div>

        {/* Achat */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informations d'achat
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Date d'achat</dt>
              <dd className="text-base font-medium text-gray-900">
                {formatDate(pneu.dateAchat)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Prix d'achat</dt>
              <dd className="text-base font-medium text-gray-900">
                {pneu.prixAchat ? `${pneu.prixAchat.toFixed(2)} €` : "N/A"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Modal de modification */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Modifier le pneu
              </h2>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-400 hover:text-gray-600"
                disabled={submitting}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Référence <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="reference"
                    value={formData.reference}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.reference
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formErrors.reference && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.reference}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marque <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="marque"
                    value={formData.marque}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.marque ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.marque && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.marque}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modèle <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="modele"
                    value={formData.modele}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.modele ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.modele && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.modele}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dimension <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="dimension"
                    value={formData.dimension}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.dimension
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formErrors.dimension && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.dimension}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de série <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="numeroSerie"
                    value={formData.numeroSerie}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.numeroSerie
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formErrors.numeroSerie && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.numeroSerie}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de véhicule
                  </label>
                  <select
                    name="vehiculeType"
                    value={formData.vehiculeType}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Camion">Camion</option>
                    <option value="Remorque">Remorque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Véhicule <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="vehicule"
                    value={formData.vehicule}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.vehicule}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kilométrage installation (km)
                  </label>
                  <input
                    type="number"
                    name="kilometrageInstallation"
                    value={formData.kilometrageInstallation}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.pressionRecommandee
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    min="0"
                  />
                  {formErrors.pressionRecommandee && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.pressionRecommandee}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'achat
                  </label>
                  <input
                    type="date"
                    name="dateAchat"
                    value={formData.dateAchat}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix d'achat (€) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="prixAchat"
                    value={formData.prixAchat}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.prixAchat
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    min="0"
                  />
                  {formErrors.prixAchat && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.prixAchat}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    name="statut"
                    value={formData.statut}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  onClick={handleCloseEditModal}
                  disabled={submitting}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
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
                      Modification...
                    </>
                  ) : (
                    "Enregistrer les modifications"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PneuDetails;
