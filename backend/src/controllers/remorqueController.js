const ResponseHandler = require("../utils/responseHandler");
const { isValidObjectId } = require("mongoose");
const {
  validateCreateRemorque,
  validateUpdateRemorque,
} = require("../validators/remorqueValidator");
const {
  getAllRemorques,
  getRemorqueById,
  getRemorquesDisponibles,
  createRemorque,
  updateRemorque,
  deleteRemorque,
} = require("../services/remorqueService");


exports.getAllRemorques = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await getAllRemorques(req.query, page, limit);
    return ResponseHandler.success(
      res,
      result,
      "Remorques récupérées avec succès"
    );
  } catch (error) {
    return ResponseHandler.error(res, error.message);
  }
};


exports.getRemorqueById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id))
      return ResponseHandler.badRequest(res, "ID de remorque invalide");
    const remorque = await getRemorqueById(req.params.id);
    return ResponseHandler.success(
      res,
      { remorque },
      "Remorque récupérée avec succès"
    );
  } catch (error) {
    if (error.message === "Remorque non trouvée")
      return ResponseHandler.notFound(res, error.message);
    return ResponseHandler.error(res, error.message);
  }
};


exports.getRemorquesDisponibles = async (req, res) => {
  try {
    const result = await getRemorquesDisponibles(req.query.type);
    return ResponseHandler.success(
      res,
      result,
      "Remorques disponibles récupérées avec succès"
    );
  } catch (error) {
    return ResponseHandler.error(res, error.message);
  }
};


exports.createRemorque = async (req, res) => {
  try {
    const { error, value } = validateCreateRemorque(req.body);
    if (error) {
      return ResponseHandler.badRequest(
        res,
        "Erreur de validation",
        error.details.map((d) => d.message)
      );
    }

    const remorque = await createRemorque(value);
    return ResponseHandler.created(
      res,
      { remorque },
      "Remorque créée avec succès"
    );
  } catch (error) {
    if (error.code === 11000 || error.message.includes("existe déjà")) {
      return ResponseHandler.badRequest(res, error.message);
    }
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


exports.updateRemorque = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id))
      return ResponseHandler.badRequest(res, "ID de remorque invalide");

    const { error, value } = validateUpdateRemorque(req.body);
    if (error) {
      return ResponseHandler.badRequest(
        res,
        "Erreur de validation",
        error.details.map((d) => d.message)
      );
    }

    const remorque = await updateRemorque(req.params.id, value);
    return ResponseHandler.success(
      res,
      { remorque },
      "Remorque mise à jour avec succès"
    );
  } catch (error) {
    if (error.message === "Remorque non trouvée")
      return ResponseHandler.notFound(res, error.message);
    if (error.code === 11000 || error.message.includes("existe déjà")) {
      return ResponseHandler.badRequest(res, error.message);
    }
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


exports.deleteRemorque = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id))
      return ResponseHandler.badRequest(res, "ID de remorque invalide");
    const remorque = await deleteRemorque(req.params.id);
    return ResponseHandler.success(
      res,
      { remorque },
      "Remorque supprimée avec succès"
    );
  } catch (error) {
    if (error.message === "Remorque non trouvée")
      return ResponseHandler.notFound(res, error.message);
    if (error.message.includes("Impossible de supprimer"))
      return ResponseHandler.badRequest(res, error.message);
    return ResponseHandler.error(res, error.message);
  }
};
