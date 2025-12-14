import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import camionService from "../services/camionService";
import pneuService from "../services/pneuService";
import maintenanceService from "../services/maintenanceService";

const CamionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [camion, setCamion] = useState(null);
  const [pneus, setPneus] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details");

  // States pour le modal de modification
  const [showEditModal, setShowEditModal] = useState(false);
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

  useEffect(() => {
    fetchAllData();
  }, [id]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validation de l'ID
      if (!id) {
        setError("ID du camion manquant");
        setLoading(false);
        return;
      }

      // Fetch en parallèle pour optimiser le chargement
      const [camionRes, pneusRes, maintenancesRes] = await Promise.all([
        camionService.getById(id).catch((err) => ({ data: null, error: err })),
        pneuService
          .getByVehicule("camion", id)
          .catch((err) => ({ data: [], error: err })),
        maintenanceService
          .getByVehicule("camion", id)
          .catch((err) => ({ data: [], error: err })),
      ]);

      // Gestion robuste des données
      setCamion(camionRes.data?.camion || null);
      setPneus(Array.isArray(pneusRes.data) ? pneusRes.data : []);
      setMaintenances(
        Array.isArray(maintenancesRes.data) ? maintenancesRes.data : []
      );

      // Si le camion n'existe pas, afficher une erreur
      if (!camionRes.data?.camion) {
        setError("Camion non trouvé");
      }
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      setError(
        err.response?.data?.message || "Erreur lors du chargement des données"
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

  const getMaintenanceStatusColor = (statut) => {
    const colors = {
      prevue: "bg-yellow-100 text-yellow-800",
      en_cours: "bg-blue-100 text-blue-800",
      terminee: "bg-green-100 text-green-800",
      annulee: "bg-red-100 text-red-800",
    };
    return colors[statut] || "bg-gray-100 text-gray-800";
  };

  const getPneuEtatColor = (etat) => {
    const colors = {
      bon: "bg-green-100 text-green-800",
      moyen: "bg-yellow-100 text-yellow-800",
      use: "bg-red-100 text-red-800",
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

  // Fonction pour formater la date pour l'input date
  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Ouvrir le modal de modification avec les données pré-remplies
  const handleOpenEditModal = () => {
    if (camion) {
      setFormData({
        matricule: camion.matricule || "",
        marque: camion.marque || "",
        modele: camion.modele || "",
        annee: camion.annee || "",
        kilometrage: camion.kilometrage || "",
        capaciteCharge: camion.capaciteCharge || "",
        typeCarburant: camion.typeCarburant || "diesel",
        statut: camion.statut || "disponible",
        dateAcquisition: formatDateForInput(camion.dateAcquisition),
      });
      setFormErrors({});
      setSuccessMessage("");
      setShowEditModal(true);
    }
  };

  // Fermer le modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
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

  // Gérer les changements dans le formulaire
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

  // Valider le formulaire
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

    if (formData.kilometrage && formData.kilometrage < 0) {
      errors.kilometrage = "Le kilométrage ne peut pas être négatif";
    }

    return errors;
  };

  // Soumettre la modification
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

      // Préparer les données à envoyer
      const dataToSend = {
        ...formData,
        annee: parseInt(formData.annee),
        kilometrage: formData.kilometrage ? parseInt(formData.kilometrage) : 0,
        capaciteCharge: parseInt(formData.capaciteCharge),
      };

      // Envoyer la requête de mise à jour
      const response = await camionService.update(id, dataToSend);

      if (response.data && response.data.camion) {
        // Mettre à jour les données du camion affichées
        setCamion(response.data.camion);
        setSuccessMessage("Camion modifié avec succès !");

        // Fermer le modal après 1.5 secondes
        setTimeout(() => {
          handleCloseEditModal();
        }, 1500);
      }
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      setFormErrors({
        submit:
          error.response?.data?.message ||
          "Erreur lors de la modification du camion",
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
          <p className="text-gray-600">Chargement des détails du camion...</p>
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
          onClick={() => navigate("/admin/camions")}
          className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          ← Retour à la liste
        </button>
      </div>
    );
  }

  if (!camion) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Camion non trouvé</p>
        <button
          onClick={() => navigate("/admin/camions")}
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
            onClick={() => navigate("/admin/camions")}
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
              Camion {camion.matricule}
            </h1>
            <p className="text-gray-600 mt-1">
              {camion.marque} {camion.modele}
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
          <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center">
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Nouvelle maintenance
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
                camion.statut
              )}`}
            >
              {camion.statut?.replace("_", " ").toUpperCase()}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Kilométrage</p>
            <p className="text-2xl font-bold text-gray-900">
              {camion.kilometrage?.toLocaleString()} km
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("details")}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === "details"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Détails
            </button>
            <button
              onClick={() => setActiveTab("pneus")}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === "pneus"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Pneus ({pneus.length})
            </button>
            <button
              onClick={() => setActiveTab("maintenances")}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === "maintenances"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Maintenances ({maintenances.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "details" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Informations générales
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500">Matricule</dt>
                    <dd className="text-base font-medium text-gray-900">
                      {camion.matricule}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Marque</dt>
                    <dd className="text-base font-medium text-gray-900">
                      {camion.marque}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Modèle</dt>
                    <dd className="text-base font-medium text-gray-900">
                      {camion.modele}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Année</dt>
                    <dd className="text-base font-medium text-gray-900">
                      {camion.annee}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Type de carburant</dt>
                    <dd className="text-base font-medium text-gray-900">
                      {camion.typeCarburant}
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
                    <dt className="text-sm text-gray-500">
                      Capacité de charge
                    </dt>
                    <dd className="text-base font-medium text-gray-900">
                      {camion.capaciteCharge} kg
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">
                      Date d'acquisition
                    </dt>
                    <dd className="text-base font-medium text-gray-900">
                      {formatDate(camion.dateAcquisition)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">
                      Dernière maintenance
                    </dt>
                    <dd className="text-base font-medium text-gray-900">
                      {formatDate(camion.derniereMaintenance)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">
                      Prochaine maintenance
                    </dt>
                    <dd className="text-base font-medium text-gray-900">
                      {formatDate(camion.prochaineMaintenance)}
                    </dd>
                  </div>
                </dl>
              </div>

              {camion.remarques && (
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Remarques
                  </h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {camion.remarques}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "pneus" && (
            <div>
              {pneus.length === 0 ? (
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
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <p className="mt-2 text-gray-500">
                    Aucun pneu associé à ce camion
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pneus.map((pneu) => (
                    <div
                      key={pneu._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {pneu.marque}
                          </p>
                          <p className="text-sm text-gray-500">
                            {pneu.dimension}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPneuEtatColor(
                            pneu.etat
                          )}`}
                        >
                          {pneu.etat}
                        </span>
                      </div>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Position:</dt>
                          <dd className="font-medium text-gray-900">
                            {pneu.position}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Pression:</dt>
                          <dd className="font-medium text-gray-900">
                            {pneu.pressionRecommandee} bar
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Installation:</dt>
                          <dd className="font-medium text-gray-900">
                            {formatDate(pneu.dateInstallation)}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "maintenances" && (
            <div>
              {maintenances.length === 0 ? (
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
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <p className="mt-2 text-gray-500">
                    Aucune maintenance enregistrée
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {maintenances.map((maintenance) => (
                    <div
                      key={maintenance._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {maintenance.type}
                            </h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getMaintenanceStatusColor(
                                maintenance.statut
                              )}`}
                            >
                              {maintenance.statut}
                            </span>
                            {maintenance.priorite && (
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  maintenance.priorite === "urgente"
                                    ? "bg-red-100 text-red-800"
                                    : maintenance.priorite === "haute"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {maintenance.priorite}
                              </span>
                            )}
                          </div>
                          {maintenance.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              {maintenance.description}
                            </p>
                          )}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">
                                Date prévue:{" "}
                              </span>
                              <span className="font-medium text-gray-900">
                                {formatDate(maintenance.datePrevue)}
                              </span>
                            </div>
                            {maintenance.dateRealisation && (
                              <div>
                                <span className="text-gray-500">
                                  Date réalisée:{" "}
                                </span>
                                <span className="font-medium text-gray-900">
                                  {formatDate(maintenance.dateRealisation)}
                                </span>
                              </div>
                            )}
                            {maintenance.cout && (
                              <div>
                                <span className="text-gray-500">Coût: </span>
                                <span className="font-medium text-gray-900">
                                  {maintenance.cout} DH
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de modification */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header du modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Modifier le camion
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

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Message de succès */}
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

              {/* Message d'erreur global */}
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
                {/* Matricule */}
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
                    placeholder="Ex: 123-TU-457567"
                  />
                  {formErrors.matricule && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.matricule}
                    </p>
                  )}
                </div>

                {/* Marque */}
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
                    placeholder="Ex: Mercedes"
                  />
                  {formErrors.marque && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.marque}
                    </p>
                  )}
                </div>

                {/* Modèle */}
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
                    placeholder="Ex: Actros"
                  />
                  {formErrors.modele && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.modele}
                    </p>
                  )}
                </div>

                {/* Année */}
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

                {/* Kilométrage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kilométrage (km)
                  </label>
                  <input
                    type="number"
                    name="kilometrage"
                    value={formData.kilometrage}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.kilometrage
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="0"
                    min="0"
                  />
                  {formErrors.kilometrage && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.kilometrage}
                    </p>
                  )}
                </div>

                {/* Capacité de charge */}
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
                    placeholder="5000"
                    min="0"
                  />
                  {formErrors.capaciteCharge && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.capaciteCharge}
                    </p>
                  )}
                </div>

                {/* Type de carburant */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de carburant
                  </label>
                  <select
                    name="typeCarburant"
                    value={formData.typeCarburant}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="diesel">Diesel</option>
                    <option value="essence">Essence</option>
                    <option value="electrique">Électrique</option>
                    <option value="hybride">Hybride</option>
                  </select>
                </div>

                {/* Statut */}
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

                {/* Date d'acquisition */}
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

              {/* Boutons d'action */}
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

export default CamionDetails;
