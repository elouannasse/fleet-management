const ResponseHandler = require("../utils/responseHandler");
const maintenanceService = require("../services/maintenanceService");
const {
  validateCreateMaintenance,
  validateUpdateMaintenance,
} = require("../validators/maintenanceValidator");

exports.getMaintenanceStats = async (req, res) => {
  try {
    const { dateDebut, dateFin } = req.query;
    const stats = await maintenanceService.getMaintenanceStats(
      dateDebut,
      dateFin
    );
    return ResponseHandler.success(res, stats, "Statistiques récupérées");
  } catch (error) {
    return ResponseHandler.error(res, error.message);
  }
};

exports.getMaintenancesByVehicule = async (req, res) => {
  try {
    const { vehiculeType, vehiculeId } = req.params;

    if (!["Camion", "Remorque"].includes(vehiculeType)) {
      return ResponseHandler.badRequest(res, "Type de véhicule invalide");
    }

    const result = await maintenanceService.getMaintenancesByVehicule(
      vehiculeType,
      vehiculeId
    );
    return ResponseHandler.success(
      res,
      result,
      "Maintenances du véhicule récupérées"
    );
  } catch (error) {
    return ResponseHandler.error(res, error.message);
  }
};

exports.getAllMaintenances = async (req, res) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;
    const result = await maintenanceService.getAllMaintenances(
      filters,
      parseInt(page),
      parseInt(limit)
    );
    return ResponseHandler.success(res, result, "Maintenances récupérées");
  } catch (error) {
    return ResponseHandler.error(res, error.message);
  }
};

exports.createMaintenance = async (req, res) => {
  try {
    const { error, value } = validateCreateMaintenance(req.body);
    if (error) {
      return ResponseHandler.badRequest(res, error.details[0].message);
    }

    // Add creePar from authenticated user
    value.creePar = req.user.id;

    const maintenance = await maintenanceService.createMaintenance(value);
    return ResponseHandler.created(
      res,
      { maintenance },
      "Maintenance créée avec succès"
    );
  } catch (error) {
    return ResponseHandler.error(res, error.message);
  }
};

exports.getMaintenanceById = async (req, res) => {
  try {
    const maintenance = await maintenanceService.getMaintenanceById(
      req.params.id
    );
    return ResponseHandler.success(
      res,
      { maintenance },
      "Maintenance récupérée"
    );
  } catch (error) {
    return ResponseHandler.error(res, error.message);
  }
};

exports.updateMaintenance = async (req, res) => {
  try {
    const { error, value } = validateUpdateMaintenance(req.body);
    if (error) {
      return ResponseHandler.badRequest(res, error.details[0].message);
    }

    const maintenance = await maintenanceService.updateMaintenance(
      req.params.id,
      value
    );
    return ResponseHandler.success(
      res,
      { maintenance },
      "Maintenance mise à jour"
    );
  } catch (error) {
    return ResponseHandler.error(res, error.message);
  }
};

exports.deleteMaintenance = async (req, res) => {
  try {
    const result = await maintenanceService.deleteMaintenance(req.params.id);
    return ResponseHandler.success(res, result, "Maintenance supprimée");
  } catch (error) {
    return ResponseHandler.error(res, error.message);
  }
};
