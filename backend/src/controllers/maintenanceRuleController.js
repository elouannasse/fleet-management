const ResponseHandler = require("../utils/responseHandler");
const maintenanceRuleService = require("../services/maintenanceRuleService");
const {
  validateCreateRule,
  validateUpdateRule,
} = require("../validators/maintenanceRuleValidator");


exports.checkAndGenerateAlerts = async (req, res) => {
  try {
    const result = await maintenanceRuleService.checkAndGenerateAlerts();
    return ResponseHandler.success(
      res,
      result,
      `${result.count} alertes générées`
    );
  } catch (error) {
    return ResponseHandler.error(res, error.message);
  }
};


exports.getAllRules = async (req, res) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;
    const result = await maintenanceRuleService.getAllRules(
      filters,
      parseInt(page),
      parseInt(limit)
    );
    return ResponseHandler.success(res, result, "Règles récupérées");
  } catch (error) {
    return ResponseHandler.error(res, error.message);
  }
};


exports.createRule = async (req, res) => {
  try {
    const { error, value } = validateCreateRule(req.body);
    if (error) {
      return ResponseHandler.badRequest(res, error.details[0].message);
    }

    const rule = await maintenanceRuleService.createRule(value, req.user._id);
    return ResponseHandler.created(res, rule, "Règle créée avec succès");
  } catch (error) {
    return ResponseHandler.error(res, error.message);
  }
};


exports.getRuleById = async (req, res) => {
  try {
    const rule = await maintenanceRuleService.getRuleById(req.params.id);
    return ResponseHandler.success(res, rule, "Règle récupérée");
  } catch (error) {
    return ResponseHandler.error(res, error.message);
  }
};

exports.updateRule = async (req, res) => {
  try {
    const { error, value } = validateUpdateRule(req.body);
    if (error) {
      return ResponseHandler.badRequest(res, error.details[0].message);
    }

    const rule = await maintenanceRuleService.updateRule(req.params.id, value);
    return ResponseHandler.success(res, rule, "Règle mise à jour");
  } catch (error) {
    return ResponseHandler.error(res, error.message);
  }
};


exports.deleteRule = async (req, res) => {
  try {
    const result = await maintenanceRuleService.deleteRule(req.params.id);
    return ResponseHandler.success(res, result, "Règle supprimée");
  } catch (error) {
    return ResponseHandler.error(res, error.message);
  }
};


exports.toggleRuleStatus = async (req, res) => {
  try {
    const rule = await maintenanceRuleService.toggleRuleStatus(req.params.id);
    return ResponseHandler.success(
      res,
      rule,
      `Règle ${rule.actif ? "activée" : "désactivée"}`
    );
  } catch (error) {
    return ResponseHandler.error(res, error.message);
  }
};
