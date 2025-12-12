const ResponseHandler = require("../utils/responseHandler");
const {
  validateCreateTrajet,
  validateUpdateTrajet,
  validateUpdateTrajetStatus,
} = require("../validators/trajetValidator");
const {
  validateChauffeur,
  validateCamion,
  validateRemorque,
  isValidObjectId,
} = require("../services/validationService");
const {
  getAllTrajets,
  getTrajetById,
  getMesTrajets,
  createTrajet: createTrajetService,
  updateTrajet: updateTrajetService,
  updateTrajetStatus: updateTrajetStatusService,
  deleteTrajet: deleteTrajetService,
  getTrajetStats,
} = require("../services/trajetService");
const { generateTrajetPDF } = require("../services/pdfService");
const { TRAJET_STATUS } = require("../utils/constants");

exports.getAllTrajets = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await getAllTrajets(
      req.query,
      req.user.id,
      req.user.role,
      page,
      limit
    );
    return ResponseHandler.success(
      res,
      result,
      "Trajets récupérés avec succès"
    );
  } catch (error) {
    return ResponseHandler.error(res, error.message);
  }
};

exports.getTrajetById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return ResponseHandler.badRequest(res, "ID de trajet invalide");
    }

    const trajet = await getTrajetById(req.params.id);

    if (
      req.user.role === "chauffeur" &&
      trajet.chauffeur._id.toString() !== req.user.id
    ) {
      return ResponseHandler.forbidden(
        res,
        "Vous n'avez pas accès à ce trajet"
      );
    }

    return ResponseHandler.success(
      res,
      { trajet },
      "Trajet récupéré avec succès"
    );
  } catch (error) {
    if (error.message === "Trajet non trouvé")
      return ResponseHandler.notFound(res, error.message);
    return ResponseHandler.error(res, error.message);
  }
};

exports.getMesTrajets = async (req, res) => {
  try {
    const { statut, page = 1, limit = 10 } = req.query;
    const result = await getMesTrajets(req.user.id, statut, page, limit);
    return ResponseHandler.success(
      res,
      result,
      "Vos trajets récupérés avec succès"
    );
  } catch (error) {
    return ResponseHandler.error(res, error.message);
  }
};

exports.createTrajet = async (req, res) => {
  try {
    const { error, value } = validateCreateTrajet(req.body);
    if (error) {
      return ResponseHandler.badRequest(
        res,
        "Erreur de validation",
        error.details.map((d) => d.message)
      );
    }

    const chauffeurVal = await validateChauffeur(value.chauffeur);
    if (!chauffeurVal.valid)
      return ResponseHandler.badRequest(res, chauffeurVal.error);

    const camionVal = await validateCamion(value.camion);
    if (!camionVal.valid)
      return ResponseHandler.badRequest(res, camionVal.error);

    const remorqueVal = await validateRemorque(value.remorque);
    if (!remorqueVal.valid)
      return ResponseHandler.badRequest(res, remorqueVal.error);

    const trajet = await createTrajetService(value, {
      chauffeur: chauffeurVal.data,
      camion: camionVal.data,
      remorque: remorqueVal.data,
    });

    return ResponseHandler.created(res, { trajet }, "Trajet créé avec succès");
  } catch (error) {
    if (error.name === "ValidationError") {
      return ResponseHandler.badRequest(
        res,
        "Erreur de validation",
        Object.values(error.errors).map((e) => e.message)
      );
    }
    return ResponseHandler.error(res, error.message);
  }
};

exports.updateTrajet = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id))
      return ResponseHandler.badRequest(res, "ID invalide");

    const { error, value } = validateUpdateTrajet(req.body);
    if (error) {
      return ResponseHandler.badRequest(
        res,
        "Erreur de validation",
        error.details.map((d) => d.message)
      );
    }

    let chauffeurData = null;
    if (value.chauffeur) {
      const chauffeurVal = await validateChauffeur(value.chauffeur);
      if (!chauffeurVal.valid)
        return ResponseHandler.badRequest(res, chauffeurVal.error);
      chauffeurData = chauffeurVal.data;
    }

    const trajet = await updateTrajetService(
      req.params.id,
      value,
      chauffeurData
    );
    return ResponseHandler.success(
      res,
      { trajet },
      "Trajet modifié avec succès"
    );
  } catch (error) {
    if (error.message === "Trajet non trouvé")
      return ResponseHandler.notFound(res, error.message);
    if (error.message.includes("Impossible de modifier"))
      return ResponseHandler.badRequest(res, error.message);
    if (error.name === "ValidationError") {
      return ResponseHandler.badRequest(
        res,
        "Erreur de validation",
        Object.values(error.errors).map((e) => e.message)
      );
    }
    return ResponseHandler.error(res, error.message);
  }
};

exports.updateTrajetStatus = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id))
      return ResponseHandler.badRequest(res, "ID invalide");

    const { error, value } = validateUpdateTrajetStatus(req.body);
    if (error) {
      return ResponseHandler.badRequest(
        res,
        "Erreur de validation",
        error.details.map((d) => d.message)
      );
    }

    const trajetCheck = await getTrajetById(req.params.id);
    if (
      req.user.role === "chauffeur" &&
      trajetCheck.chauffeur._id.toString() !== req.user.id
    ) {
      return ResponseHandler.forbidden(
        res,
        "Vous ne pouvez pas modifier ce trajet"
      );
    }

    const trajet = await updateTrajetStatusService(req.params.id, value);
    return ResponseHandler.success(
      res,
      { trajet },
      "Statut du trajet mis à jour avec succès"
    );
  } catch (error) {
    if (error.message === "Trajet non trouvé")
      return ResponseHandler.notFound(res, error.message);
    if (error.message.includes("ne peut"))
      return ResponseHandler.badRequest(res, error.message);
    if (error.name === "ValidationError") {
      return ResponseHandler.badRequest(
        res,
        "Erreur de validation",
        Object.values(error.errors).map((e) => e.message)
      );
    }
    return ResponseHandler.error(res, error.message);
  }
};

exports.deleteTrajet = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id))
      return ResponseHandler.badRequest(res, "ID invalide");
    await deleteTrajetService(req.params.id);
    return ResponseHandler.success(res, null, "Trajet supprimé avec succès");
  } catch (error) {
    if (error.message === "Trajet non trouvé")
      return ResponseHandler.notFound(res, error.message);
    if (error.message.includes("Impossible de supprimer"))
      return ResponseHandler.badRequest(res, error.message);
    return ResponseHandler.error(res, error.message);
  }
};

exports.getTrajetStats = async (req, res) => {
  try {
    const stats = await getTrajetStats(req.query, req.user.id, req.user.role);
    return ResponseHandler.success(
      res,
      stats,
      "Statistiques récupérées avec succès"
    );
  } catch (error) {
    return ResponseHandler.error(res, error.message);
  }
};


exports.generateTrajetPDF = async (req, res) => {
  try {
    const { id } = req.params;

   
    if (!isValidObjectId(id)) {
      return ResponseHandler.badRequest(res, "ID de trajet invalide");
    }

   
    const trajet = await getTrajetById(id);

    if (!trajet) {
      return ResponseHandler.notFound(res, "Trajet non trouvé");
    }

    
    if (
      req.user.role === "chauffeur" &&
      trajet.chauffeur._id.toString() !== req.user.id
    ) {
      return ResponseHandler.forbidden(res, "Accès non autorisé à ce trajet");
    }

    
    const pdfBuffer = await generateTrajetPDF(trajet);

    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="trajet-${trajet._id}.pdf"`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Erreur génération PDF:", error);
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la génération du PDF"
    );
  }
};
