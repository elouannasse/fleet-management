const ResponseHandler = require("../utils/responseHandler");
const {
  validateCreatePneu,
  validateUpdatePneu,
  validateUpdatePneuEtat,
} = require("../validators/pneuValidator");
const {
  getAllPneus,
  getPneuById,
  getPneusByVehicule,
  createPneu,
  updatePneu,
  updatePneuEtat,
  deletePneu,
} = require("../services/pneuService");
const { isValidObjectId } = require("../services/validationService");


exports.getAllPneus = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await getAllPneus(req.query, page, limit);

    return ResponseHandler.success(
      res,
      {
        pneus: result.pneus,
        pagination: {
          total: result.total,
          page: result.page,
          pages: result.pages,
          limit: result.limit,
        },
      },
      "Pneus récupérés avec succès"
    );
  } catch (error) {
    console.error("Get all pneus error:", error);
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la récupération des pneus"
    );
  }
};


exports.getPneuById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return ResponseHandler.badRequest(res, "ID de pneu invalide");
    }

    const pneu = await getPneuById(req.params.id);

    return ResponseHandler.success(res, { pneu }, "Pneu récupéré avec succès");
  } catch (error) {
    console.error("Get pneu by ID error:", error);

    if (error.message === "Pneu non trouvé") {
      return ResponseHandler.notFound(res, error.message);
    }

    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la récupération du pneu"
    );
  }
};


exports.getPneusByVehicule = async (req, res) => {
  try {
    const { vehiculeType, vehiculeId } = req.params;

    if (!isValidObjectId(vehiculeId)) {
      return ResponseHandler.badRequest(res, "ID de véhicule invalide");
    }

    const result = await getPneusByVehicule(vehiculeType, vehiculeId);

    return ResponseHandler.success(
      res,
      result,
      "Pneus du véhicule récupérés avec succès"
    );
  } catch (error) {
    console.error("Get pneus by vehicle error:", error);

    if (error.message.includes("invalide")) {
      return ResponseHandler.badRequest(res, error.message);
    }

    if (error.message.includes("non trouvé")) {
      return ResponseHandler.notFound(res, error.message);
    }

    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la récupération des pneus du véhicule"
    );
  }
};


exports.createPneu = async (req, res) => {
  try {
 
    const { error, value } = validateCreatePneu(req.body);

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return ResponseHandler.badRequest(res, "Erreur de validation", errors);
    }

  
    const pneu = await createPneu(value);

    return ResponseHandler.created(res, { pneu }, "Pneu créé avec succès");
  } catch (error) {
    console.error("Create pneu error:", error);

    if (error.message.includes("non trouvé")) {
      return ResponseHandler.notFound(res, error.message);
    }

    if (error.message.includes("existe déjà")) {
      return ResponseHandler.badRequest(res, error.message);
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return ResponseHandler.badRequest(res, "Erreur de validation", errors);
    }

    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la création du pneu"
    );
  }
};

// PUT /api/pneus/:id - Modifier un pneu
exports.updatePneu = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return ResponseHandler.badRequest(res, "ID invalide");
    }

   
    const { error, value } = validateUpdatePneu(req.body);

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return ResponseHandler.badRequest(res, "Erreur de validation", errors);
    }

   
    const pneu = await updatePneu(req.params.id, value);

    return ResponseHandler.success(
      res,
      { pneu },
      "Pneu mis à jour avec succès"
    );
  } catch (error) {
    console.error("Update pneu error:", error);

    if (error.message === "Pneu non trouvé") {
      return ResponseHandler.notFound(res, error.message);
    }

    if (error.message.includes("non trouvé")) {
      return ResponseHandler.notFound(res, error.message);
    }

    if (error.message.includes("existe déjà")) {
      return ResponseHandler.badRequest(res, error.message);
    }

    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID invalide");
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return ResponseHandler.badRequest(res, "Erreur de validation", errors);
    }

    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la mise à jour du pneu"
    );
  }
};


exports.updatePneuEtat = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return ResponseHandler.badRequest(res, "ID de pneu invalide");
    }

   
    const { error, value } = validateUpdatePneuEtat(req.body);

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return ResponseHandler.badRequest(res, "Erreur de validation", errors);
    }

    
    const pneu = await updatePneuEtat(req.params.id, value.etat);

    return ResponseHandler.success(
      res,
      { pneu },
      "État du pneu mis à jour avec succès"
    );
  } catch (error) {
    console.error("Update pneu etat error:", error);

    if (error.message === "Pneu non trouvé") {
      return ResponseHandler.notFound(res, error.message);
    }

    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID de pneu invalide");
    }

    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la mise à jour de l'état du pneu"
    );
  }
};


exports.deletePneu = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return ResponseHandler.badRequest(res, "ID de pneu invalide");
    }

    const pneu = await deletePneu(req.params.id);

    return ResponseHandler.success(res, { pneu }, "Pneu supprimé avec succès");
  } catch (error) {
    console.error("Delete pneu error:", error);

    if (error.message === "Pneu non trouvé") {
      return ResponseHandler.notFound(res, error.message);
    }

    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID de pneu invalide");
    }

    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la suppression du pneu"
    );
  }
};
