const ResponseHandler = require("../utils/responseHandler");
const {
  validateCreateCamion,
  validateUpdateCamion,
} = require("../validators/camionValidator");
const {
  getAllCamions,
  getCamionById,
  getCamionsDisponibles,
  createCamion,
  updateCamion,
  deleteCamion,
} = require("../services/camionService");
const { isValidObjectId } = require("../services/validationService");


exports.getAllCamions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await getAllCamions(req.query, page, limit);

    return ResponseHandler.success(
      res,
      {
        camions: result.camions,
        pagination: {
          total: result.total,
          page: result.page,
          pages: result.pages,
          limit: result.limit,
        },
      },
      "Camions récupérés avec succès"
    );
  } catch (error) {
    console.error("Get all camions error:", error);
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la récupération des camions"
    );
  }
};


exports.getCamionById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return ResponseHandler.badRequest(res, "ID de camion invalide");
    }

    const camion = await getCamionById(req.params.id);

    return ResponseHandler.success(
      res,
      { camion },
      "Camion récupéré avec succès"
    );
  } catch (error) {
    console.error("Get camion by ID error:", error);

    if (error.message === "Camion non trouvé") {
      return ResponseHandler.notFound(res, error.message);
    }

    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID de camion invalide");
    }

    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la récupération du camion"
    );
  }
};


exports.getCamionsDisponibles = async (req, res) => {
  try {
    const result = await getCamionsDisponibles();

    return ResponseHandler.success(
      res,
      result,
      "Camions disponibles récupérés avec succès"
    );
  } catch (error) {
    console.error("Get available camions error:", error);
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la récupération des camions disponibles"
    );
  }
};


exports.createCamion = async (req, res) => {
  try {
    
    const { error, value } = validateCreateCamion(req.body);

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return ResponseHandler.badRequest(res, "Erreur de validation", errors);
    }

   
    const camion = await createCamion(value);

    return ResponseHandler.created(res, { camion }, "Camion créé avec succès");
  } catch (error) {
    console.error("Create camion error:", error);

    if (error.message === "Un camion avec cette matricule existe déjà") {
      return ResponseHandler.badRequest(res, error.message);
    }

    if (error.code === 11000) {
      return ResponseHandler.badRequest(
        res,
        "Un camion avec cette matricule existe déjà"
      );
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return ResponseHandler.badRequest(res, "Erreur de validation", errors);
    }

    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la création du camion"
    );
  }
};


exports.updateCamion = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return ResponseHandler.badRequest(res, "ID de camion invalide");
    }

    
    const { error, value } = validateUpdateCamion(req.body);

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return ResponseHandler.badRequest(res, "Erreur de validation", errors);
    }

    
    const camion = await updateCamion(req.params.id, value);

    return ResponseHandler.success(
      res,
      { camion },
      "Camion mis à jour avec succès"
    );
  } catch (error) {
    console.error("Update camion error:", error);

    if (error.message === "Camion non trouvé") {
      return ResponseHandler.notFound(res, error.message);
    }

    if (error.message === "Un camion avec cette matricule existe déjà") {
      return ResponseHandler.badRequest(res, error.message);
    }

    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID de camion invalide");
    }

    if (error.code === 11000) {
      return ResponseHandler.badRequest(
        res,
        "Un camion avec cette matricule existe déjà"
      );
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return ResponseHandler.badRequest(res, "Erreur de validation", errors);
    }

    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la mise à jour du camion"
    );
  }
};


exports.deleteCamion = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return ResponseHandler.badRequest(res, "ID de camion invalide");
    }

    const camion = await deleteCamion(req.params.id);

    return ResponseHandler.success(
      res,
      { camion },
      "Camion supprimé avec succès"
    );
  } catch (error) {
    console.error("Delete camion error:", error);

    if (error.message === "Camion non trouvé") {
      return ResponseHandler.notFound(res, error.message);
    }

    if (error.message.includes("Impossible de supprimer")) {
      return ResponseHandler.badRequest(res, error.message);
    }

    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID de camion invalide");
    }

    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la suppression du camion"
    );
  }
};
