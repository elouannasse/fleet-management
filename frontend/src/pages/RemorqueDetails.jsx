import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import remorqueService from "../services/remorqueService";

const RemorqueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [remorque, setRemorque] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States pour le modal de modification
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    matricule: "",
    marque: "",
    modele: "",
    annee: "",
    capaciteCharge: "",
    type: "frigorifique",
    statut: "disponible",
    dateAcquisition: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchRemorque();
  }, [id]);

  const fetchRemorque = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        setError("ID de la remorque manquant");
        setLoading(false);
        return;
      }

      const response = await remorqueService.getById(id);

      if (response && response.data && response.data.remorque) {
        setRemorque(response.data.remorque);
      } else {
        setError("Remorque non trouvée");
      }
    } catch (err) {
      console.error("Erreur lors du chargement de la remorque:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors du chargement de la remorque"
      );
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
    if (remorque) {
      setFormData({
        matricule: remorque.matricule || "",
        marque: remorque.marque || "",
        modele: remorque.modele || "",
        annee: remorque.annee || "",
        capaciteCharge: remorque.capaciteCharge || "",
        type: remorque.type || "frigorifique",
        statut: remorque.statut || "disponible",
        dateAcquisition: formatDateForInput(remorque.dateAcquisition),
      });
      setFormErrors({});
      setSuccessMessage("");
      setShowEditModal(true);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setFormData({
      matricule: "",
      marque: "",
      modele: "",
      annee: "",
      capaciteCharge: "",
      type: "frigorifique",
      statut: "disponible",
      dateAcquisition: "",
    });
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
      formData.annee < 1990 ||
      formData.annee > new Date().getFullYear() + 1
    ) {
      errors.annee =
        "L'année doit être entre 1990 et " + (new Date().getFullYear() + 1);
    }

    if (!formData.capaciteCharge) {
      errors.capaciteCharge = "La capacité de charge est requise";
    } else if (formData.capaciteCharge <= 0) {
      errors.capaciteCharge = "La capacité doit être positive";
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
        annee: parseInt(formData.annee),
        capaciteCharge: parseInt(formData.capaciteCharge),
      };

      const response = await remorqueService.update(id, dataToSend);

      if (response.data && response.data.remorque) {
        setRemorque(response.data.remorque);
        setSuccessMessage("Remorque modifiée avec succès !");

        setTimeout(() => {
          handleCloseEditModal();
        }, 1500);
      }
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      setFormErrors({
        submit:
          error.response?.data?.message ||
          "Erreur lors de la modification de la remorque",
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
          <p className="text-gray-600">
            Chargement des détails de la remorque...
          </p>
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
          onClick={() => navigate("/admin/remorques")}
          className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          ← Retour à la liste
        </button>
      </div>
    );
  }

  if (!remorque) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Remorque non trouvée</p>
        <button
          onClick={() => navigate("/admin/remorques")}
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
            onClick={() => navigate("/admin/remorques")}
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
              Remorque {remorque.matricule}
            </h1>
            <p className="text-gray-600 mt-1">
              {remorque.marque} {remorque.modele}
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

      {/* Statut Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Statut actuel</p>
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                remorque.statut
              )}`}
            >
              {remorque.statut?.replace("_", " ").toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Détails */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informations générales
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-500">Matricule</dt>
                  <dd className="text-base font-medium text-gray-900">
                    {remorque.matricule}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Marque</dt>
                  <dd className="text-base font-medium text-gray-900">
                    {remorque.marque}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Modèle</dt>
                  <dd className="text-base font-medium text-gray-900">
                    {remorque.modele}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Année</dt>
                  <dd className="text-base font-medium text-gray-900">
                    {remorque.annee}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Type</dt>
                  <dd className="text-base font-medium text-gray-900 capitalize">
                    {remorque.type}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Caractéristiques
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-500">Capacité de charge</dt>
                  <dd className="text-base font-medium text-gray-900">
                    {remorque.capaciteCharge} kg
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Date d'acquisition</dt>
                  <dd className="text-base font-medium text-gray-900">
                    {formatDate(remorque.dateAcquisition)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de modification */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Modifier la remorque
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
                    Matricule <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="matricule"
                    value={formData.matricule}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.matricule
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Ex: 789-RE-0333"
                  />
                  {formErrors.matricule && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.matricule}
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
                    placeholder="Ex: Schmitz"
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
                    placeholder="Ex: Cargobull"
                  />
                  {formErrors.modele && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.modele}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Année <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="annee"
                    value={formData.annee}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.annee ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="2024"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                  />
                  {formErrors.annee && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.annee}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacité de charge (kg){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="capaciteCharge"
                    value={formData.capaciteCharge}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.capaciteCharge
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="30000"
                    min="0"
                  />
                  {formErrors.capaciteCharge && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.capaciteCharge}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="frigorifique">Frigorifique</option>
                    <option value="bâchée">Bâchée</option>
                    <option value="plateau">Plateau</option>
                    <option value="citerne">Citerne</option>
                  </select>
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
                    <option value="disponible">Disponible</option>
                    <option value="en_mission">En mission</option>
                    <option value="en_maintenance">En maintenance</option>
                    <option value="hors_service">Hors service</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'acquisition
                  </label>
                  <input
                    type="date"
                    name="dateAcquisition"
                    value={formData.dateAcquisition}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
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

export default RemorqueDetails;
