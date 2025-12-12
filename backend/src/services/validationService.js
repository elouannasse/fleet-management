const User = require("../models/User");
const Camion = require("../models/Camion");
const Remorque = require("../models/Remorque");
const { VEHICULE_STATUS, ROLES } = require("../utils/constants");


const validateChauffeur = async (chauffeurId) => {
  const chauffeur = await User.findById(chauffeurId);

  if (!chauffeur) {
    return { valid: false, error: "Chauffeur non trouvé" };
  }

  if (!chauffeur.isActive) {
    return { valid: false, error: "Le chauffeur est inactif" };
  }

  if (chauffeur.role !== ROLES.CHAUFFEUR) {
    return {
      valid: false,
      error: "L'utilisateur sélectionné n'est pas un chauffeur",
    };
  }

  return { valid: true, data: chauffeur };
};


const validateCamion = async (camionId, checkDisponibilite = true) => {
  const camion = await Camion.findById(camionId);

  if (!camion) {
    return { valid: false, error: "Camion non trouvé" };
  }

  if (checkDisponibilite && camion.statut !== VEHICULE_STATUS.DISPONIBLE) {
    return {
      valid: false,
      error: `Le camion n'est pas disponible (statut actuel: ${camion.statut})`,
    };
  }

  return { valid: true, data: camion };
};


const validateRemorque = async (remorqueId, checkDisponibilite = true) => {
  if (!remorqueId) {
    return { valid: true, data: null };
  }

  const remorque = await Remorque.findById(remorqueId);

  if (!remorque) {
    return { valid: false, error: "Remorque non trouvée" };
  }

  if (checkDisponibilite && remorque.statut !== VEHICULE_STATUS.DISPONIBLE) {
    return {
      valid: false,
      error: `La remorque n'est pas disponible (statut actuel: ${remorque.statut})`,
    };
  }

  return { valid: true, data: remorque };
};


const validateRequiredFields = (data, requiredFields) => {
  const missing = requiredFields.filter((field) => !data[field]);

  if (missing.length > 0) {
    return {
      valid: false,
      error: `Les champs suivants sont requis: ${missing.join(", ")}`,
    };
  }

  return { valid: true };
};


const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

module.exports = {
  validateChauffeur,
  validateCamion,
  validateRemorque,
  validateRequiredFields,
  isValidObjectId,
};
