import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import trajetService from "../services/trajetService";
import userService from "../services/userService";
import camionService from "../services/camionService";
import remorqueService from "../services/remorqueService";

const TrajetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trajet, setTrajet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Données pour les selects
  const [chauffeurs, setChauffeurs] = useState([]);
  const [camions, setCamions] = useState([]);
  const [remorques, setRemorques] = useState([]);

  // Formulaire d'édition
  const [editFormData, setEditFormData] = useState({
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
    statut: "",
    remarques: "",
  });

  const [newStatus, setNewStatus] = useState("");
  const [editErrors, setEditErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Charger les listes d'abord, puis le trajet
    loadAllData();
  }, [id]);

  const loadAllData = async () => {
    try {
      // Charger toutes les listes en parallèle AVANT le trajet
      await Promise.all([
        fetchChauffeurs(),
        fetchCamionsDisponibles(),
        fetchRemorquesDisponibles(),
      ]);

      // PUIS charger le trajet (pour que les selects aient leurs options)
      await fetchTrajetDetails();
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    }
  };

  const fetchTrajetDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await trajetService.getById(id);

      // DEBUG: Afficher les données reçues
      console.log("=== DEBUG TRAJET ===");
      console.log("Response complète:", response);
      console.log("Response.success:", response.success);
      console.log("Response.data:", response.data);
      console.log("Trajet:", response.data?.trajet);
      console.log("Chauffeur:", response.data?.trajet?.chauffeur);
      console.log("Nom chauffeur:", response.data?.trajet?.chauffeur?.name);
      console.log("==================");

      if (response && response.success && response.data) {
        const trajetData = response.data.trajet;
        console.log("Trajet à définir:", trajetData);
        setTrajet(trajetData);
      } else {
        setError("Trajet non trouvé");
      }
    } catch (err) {
      console.error("Erreur lors du chargement du trajet:", err);
      setError(
        err.response?.data?.message || "Erreur lors du chargement du trajet"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchChauffeurs = async () => {
    try {
      const response = await userService.getChauffeurs();
      if (response && response.data) {
        const chauffeursList = Array.isArray(response.data.chauffeurs)
          ? response.data.chauffeurs
          : [];
        setChauffeurs(chauffeursList);
        console.log("✅ Chauffeurs chargés:", chauffeursList.length);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des chauffeurs:", err);
    }
  };

  const fetchCamionsDisponibles = async () => {
    try {
      const response = await camionService.getDisponibles();
      if (response && response.data) {
        const camionsList = Array.isArray(response.data.camions)
          ? response.data.camions
          : [];
        setCamions(camionsList);
        console.log("✅ Camions chargés:", camionsList.length);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des camions:", err);
    }
  };

  const fetchRemorquesDisponibles = async () => {
    try {
      const response = await remorqueService.getDisponibles();
      if (response && response.data) {
        const remorquesList = Array.isArray(response.data.remorques)
          ? response.data.remorques
          : [];
        setRemorques(remorquesList);
        console.log("✅ Remorques chargées:", remorquesList.length);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des remorques:", err);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          badges[statut] || "bg-gray-100 text-gray-800"
        }`}
      >
        {labels[statut] || statut}
      </span>
    );
  };

  const handleOpenEditModal = () => {
    if (!trajet) return;

    console.log("\n🔧 OUVERTURE MODAL MODIFICATION");
    console.log("📊 Listes disponibles:");
    console.log("  - Chauffeurs:", chauffeurs.length, "disponibles");
    console.log("  - Camions:", camions.length, "disponibles");
    console.log("  - Remorques:", remorques.length, "disponibles");
    console.log("📋 Trajet actuel:");
    console.log("  - Chauffeur ID:", trajet.chauffeur?._id);
    console.log("  - Camion ID:", trajet.camion?._id);
    console.log("  - Remorque ID:", trajet.remorque?._id);

    const formData = {
      chauffeur: trajet.chauffeur?._id || "",
      camion: trajet.camion?._id || "",
      remorque: trajet.remorque?._id || "",
      lieuDepart: trajet.lieuDepart || "",
      lieuArrivee: trajet.lieuArrivee || "",
      dateDepart: formatDateForInput(trajet.dateDepart) || "",
      dateArrivee: formatDateForInput(trajet.dateArrivee) || "",
      distancePrevue: trajet.distancePrevue || "",
      marchandise: trajet.marchandise || "",
      poids: trajet.poidsMarchandise || "",
      statut: trajet.statut || "",
      remarques: trajet.remarques || "",
    };

    console.log("✍️ FormData initialisé:", {
      chauffeur: formData.chauffeur,
      camion: formData.camion,
      remorque: formData.remorque,
    });

    setEditFormData(formData);
    setEditErrors({});
    setSuccessMessage("");
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditErrors({});
    setSuccessMessage("");
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (editErrors[name]) {
      setEditErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateEditForm = () => {
    const errors = {};

    if (!editFormData.chauffeur) errors.chauffeur = "Le chauffeur est requis";
    if (!editFormData.camion) errors.camion = "Le camion est requis";
    if (!editFormData.remorque) errors.remorque = "La remorque est requise";
    if (!editFormData.lieuDepart.trim())
      errors.lieuDepart = "Le lieu de départ est requis";
    if (!editFormData.lieuArrivee.trim())
      errors.lieuArrivee = "Le lieu d'arrivée est requis";
    if (!editFormData.dateDepart)
      errors.dateDepart = "La date de départ est requise";
    if (!editFormData.dateArrivee)
      errors.dateArrivee = "La date d'arrivée est requise";
    if (!editFormData.distancePrevue || editFormData.distancePrevue <= 0) {
      errors.distancePrevue = "La distance doit être supérieure à 0";
    }
    if (!editFormData.marchandise.trim())
      errors.marchandise = "Le type de marchandise est requis";
    if (!editFormData.poids || editFormData.poids <= 0) {
      errors.poids = "Le poids doit être supérieur à 0";
    }

    // Vérifier que la date d'arrivée est après la date de départ
    if (editFormData.dateDepart && editFormData.dateArrivee) {
      const depart = new Date(editFormData.dateDepart);
      const arrivee = new Date(editFormData.dateArrivee);
      if (arrivee <= depart) {
        errors.dateArrivee =
          "La date d'arrivée doit être après la date de départ";
      }
    }

    return errors;
  };

  const handleUpdateTrajet = async (e) => {
    e.preventDefault();

    const errors = validateEditForm();
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      setEditErrors({});

      // Convertir les dates en format ISO
      const dataToSend = {
        chauffeur: editFormData.chauffeur,
        camion: editFormData.camion,
        remorque: editFormData.remorque,
        lieuDepart: editFormData.lieuDepart,
        lieuArrivee: editFormData.lieuArrivee,
        dateDepart: new Date(editFormData.dateDepart).toISOString(),
        dateArrivee: new Date(editFormData.dateArrivee).toISOString(),
        distancePrevue: parseInt(editFormData.distancePrevue),
        marchandise: editFormData.marchandise,
        poidsMarchandise: parseInt(editFormData.poids),
        statut: editFormData.statut,
      };

      if (editFormData.remarques) {
        dataToSend.remarques = editFormData.remarques;
      }

      console.log("=== DONNÉES ENVOYÉES ===");
      console.log("Données à envoyer:", dataToSend);
      console.log("=====================");

      const response = await trajetService.update(id, dataToSend);

      if (response.success) {
        setSuccessMessage("Trajet modifié avec succès !");
        await fetchTrajetDetails();

        setTimeout(() => {
          handleCloseEditModal();
        }, 1500);
      }
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      setEditErrors({
        submit:
          error.response?.data?.message ||
          "Erreur lors de la modification du trajet",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenStatusModal = () => {
    if (!trajet) return;
    setNewStatus(trajet.statut);
    setSuccessMessage("");
    setShowStatusModal(true);
  };

  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setNewStatus("");
    setSuccessMessage("");
  };

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === trajet?.statut) {
      handleCloseStatusModal();
      return;
    }

    try {
      setSubmitting(true);
      const response = await trajetService.updateStatus(id, newStatus);

      if (response.success) {
        setSuccessMessage("Statut modifié avec succès !");
        await fetchTrajetDetails();

        setTimeout(() => {
          handleCloseStatusModal();
        }, 1500);
      }
    } catch (error) {
      console.error("Erreur lors de la modification du statut:", error);
      setEditErrors({
        submit:
          error.response?.data?.message ||
          "Erreur lors de la modification du statut",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleDeleteTrajet = async () => {
    try {
      setSubmitting(true);
      await trajetService.delete(id);

      navigate("/admin/trajets", { replace: true });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setError(
        error.response?.data?.message ||
          "Erreur lors de la suppression du trajet"
      );
      setShowDeleteModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du trajet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
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
        <Link to="/admin/trajets" className="text-blue-600 hover:text-blue-800">
          ← Retour à la liste des trajets
        </Link>
      </div>
    );
  }

  if (!trajet) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Trajet non trouvé</p>
        <Link
          to="/admin/trajets"
          className="text-blue-600 hover:text-blue-800 mt-4 inline-block"
        >
          ← Retour à la liste des trajets
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="mb-6">
        <Link
          to="/admin/trajets"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
        >
          <svg
            className="w-5 h-5 mr-1"
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
          Retour à la liste
        </Link>

        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Détails du trajet
            </h1>
            <p className="text-gray-600 mt-1">
              {trajet.lieuDepart} → {trajet.lieuArrivee}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleOpenEditModal}
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Modifier
            </button>
            <button
              onClick={handleOpenStatusModal}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"
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
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
              Changer statut
            </button>
            <button
              onClick={handleOpenDeleteModal}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
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
              Supprimer
            </button>
          </div>
        </div>
      </div>

      {/* Section Informations générales */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <svg
            className="w-6 h-6 mr-2 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Informations générales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Statut</p>
            <div className="mt-1">{getStatusBadge(trajet.statut)}</div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Date de départ</p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(trajet.dateDepart)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Date d'arrivée prévue
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(trajet.dateArrivee)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Distance prévue</p>
            <p className="mt-1 text-sm text-gray-900">
              {trajet.distancePrevue} km
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Type de marchandise
            </p>
            <p className="mt-1 text-sm text-gray-900">{trajet.marchandise}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Poids</p>
            <p className="mt-1 text-sm text-gray-900">
              {trajet.poidsMarchandise
                ? `${trajet.poidsMarchandise.toLocaleString()} kg`
                : "N/A"}
            </p>
          </div>
        </div>

        {trajet.remarques && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-500">Remarques</p>
            <p className="mt-1 text-sm text-gray-900">{trajet.remarques}</p>
          </div>
        )}
      </div>

      {/* Section Transport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Chauffeur */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <svg
              className="w-6 h-6 mr-2 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Chauffeur
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Nom</p>
              <p className="mt-1 text-sm text-gray-900">
                {trajet.chauffeur?.name || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="mt-1 text-sm text-gray-900">
                {trajet.chauffeur?.email || "N/A"}
              </p>
            </div>
            {trajet.chauffeur?.telephone && (
              <div>
                <p className="text-sm font-medium text-gray-500">Téléphone</p>
                <p className="mt-1 text-sm text-gray-900">
                  {trajet.chauffeur.telephone}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Camion */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <svg
              className="w-6 h-6 mr-2 text-blue-600"
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
            Camion
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Matricule</p>
              <p className="mt-1 text-sm text-gray-900">
                {trajet.camion?.matricule || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Marque / Modèle
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {trajet.camion?.marque} {trajet.camion?.modele}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Année</p>
              <p className="mt-1 text-sm text-gray-900">
                {trajet.camion?.annee || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Remorque */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <svg
              className="w-6 h-6 mr-2 text-blue-600"
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
            Remorque
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Matricule</p>
              <p className="mt-1 text-sm text-gray-900">
                {trajet.remorque?.matricule || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Type</p>
              <p className="mt-1 text-sm text-gray-900">
                {trajet.remorque?.type || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Capacité</p>
              <p className="mt-1 text-sm text-gray-900">
                {trajet.remorque?.capaciteCharge
                  ? `${(trajet.remorque.capaciteCharge / 1000).toFixed(
                      1
                    )} tonnes`
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'édition */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Modifier le trajet
              </h2>
              <button
                onClick={handleCloseEditModal}
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

            <form onSubmit={handleUpdateTrajet} className="p-6">
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

              {editErrors.submit && (
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
                      {editErrors.submit}
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
                      value={editFormData.chauffeur}
                      onChange={handleEditInputChange}
                      disabled={submitting}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                        editErrors.chauffeur
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
                    {editErrors.chauffeur && (
                      <p className="mt-1 text-sm text-red-500">
                        {editErrors.chauffeur}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Camion <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="camion"
                      value={editFormData.camion}
                      onChange={handleEditInputChange}
                      disabled={submitting}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                        editErrors.camion ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Sélectionner un camion</option>
                      {camions.map((camion) => (
                        <option key={camion._id} value={camion._id}>
                          {camion.matricule} - {camion.marque} {camion.modele}
                        </option>
                      ))}
                    </select>
                    {editErrors.camion && (
                      <p className="mt-1 text-sm text-red-500">
                        {editErrors.camion}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remorque <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="remorque"
                      value={editFormData.remorque}
                      onChange={handleEditInputChange}
                      disabled={submitting}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                        editErrors.remorque
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
                    {editErrors.remorque && (
                      <p className="mt-1 text-sm text-red-500">
                        {editErrors.remorque}
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
                      value={editFormData.lieuDepart}
                      onChange={handleEditInputChange}
                      disabled={submitting}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                        editErrors.lieuDepart
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {editErrors.lieuDepart && (
                      <p className="mt-1 text-sm text-red-500">
                        {editErrors.lieuDepart}
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
                      value={editFormData.lieuArrivee}
                      onChange={handleEditInputChange}
                      disabled={submitting}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                        editErrors.lieuArrivee
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {editErrors.lieuArrivee && (
                      <p className="mt-1 text-sm text-red-500">
                        {editErrors.lieuArrivee}
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
                      value={editFormData.dateDepart}
                      onChange={handleEditInputChange}
                      disabled={submitting}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                        editErrors.dateDepart
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {editErrors.dateDepart && (
                      <p className="mt-1 text-sm text-red-500">
                        {editErrors.dateDepart}
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
                      value={editFormData.dateArrivee}
                      onChange={handleEditInputChange}
                      disabled={submitting}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                        editErrors.dateArrivee
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {editErrors.dateArrivee && (
                      <p className="mt-1 text-sm text-red-500">
                        {editErrors.dateArrivee}
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
                      value={editFormData.distancePrevue}
                      onChange={handleEditInputChange}
                      disabled={submitting}
                      min="1"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                        editErrors.distancePrevue
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {editErrors.distancePrevue && (
                      <p className="mt-1 text-sm text-red-500">
                        {editErrors.distancePrevue}
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
                      value={editFormData.marchandise}
                      onChange={handleEditInputChange}
                      disabled={submitting}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                        editErrors.marchandise
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {editErrors.marchandise && (
                      <p className="mt-1 text-sm text-red-500">
                        {editErrors.marchandise}
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
                      value={editFormData.poids}
                      onChange={handleEditInputChange}
                      disabled={submitting}
                      min="1"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                        editErrors.poids ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {editErrors.poids && (
                      <p className="mt-1 text-sm text-red-500">
                        {editErrors.poids}
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
                      value={editFormData.statut}
                      onChange={handleEditInputChange}
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
                      value={editFormData.remarques}
                      onChange={handleEditInputChange}
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
                  onClick={handleCloseEditModal}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting
                    ? "Enregistrement..."
                    : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal changement de statut */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Changer le statut
            </h3>

            {successMessage && (
              <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <p className="text-sm font-medium text-green-800">
                  {successMessage}
                </p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau statut
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                disabled={submitting}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="planifié">Planifié</option>
                <option value="en_cours">En cours</option>
                <option value="terminé">Terminé</option>
                <option value="annulé">Annulé</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCloseStatusModal}
                disabled={submitting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {submitting ? "Modification..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {showDeleteModal && (
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
              Êtes-vous sûr de vouloir supprimer ce trajet ? Cette action est
              irréversible.
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

export default TrajetDetails;
