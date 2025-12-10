const MaintenanceRule = require("../models/MaintenanceRule");
const ResponseHandler = require("../utils/responseHandler");
const { MAINTENANCE_TYPES } = require("../utils/constants");


exports.getAllRules = async (req, res) => {
  try {
    const { type, actif, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (actif !== undefined) filter.actif = actif === "true";

    const skip = (page - 1) * limit;

    const rules = await MaintenanceRule.find(filter)
      .populate("creePar", "nom prenom email")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await MaintenanceRule.countDocuments(filter);

    return ResponseHandler.success(
      res,
      {
        rules,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
      },
      "Règles de maintenance récupérées avec succès"
    );
  } catch (error) {
    console.error("Get all rules error:", error);
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la récupération des règles"
    );
  }
};


exports.getRuleById = async (req, res) => {
  try {
    const rule = await MaintenanceRule.findById(req.params.id).populate(
      "creePar",
      "nom prenom email"
    );

    if (!rule) {
      return ResponseHandler.notFound(res, "Règle de maintenance non trouvée");
    }

    return ResponseHandler.success(
      res,
      { rule },
      "Règle récupérée avec succès"
    );
  } catch (error) {
    console.error("Get rule by ID error:", error);
    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID de règle invalide");
    }
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la récupération de la règle"
    );
  }
};

// Create maintenance rule
exports.createRule = async (req, res) => {
  try {
    const {
      nom,
      type,
      typeAlerte,
      description,
      intervalleKm,
      intervalleJours,
      seuilAlerteKm,
      seuilAlerteJours,
      vehiculeTypes,
      actif,
    } = req.body;

    if (!nom || !type || !typeAlerte) {
      return ResponseHandler.badRequest(
        res,
        "Veuillez fournir le nom, le type et le type d'alerte"
      );
    }

    if (!intervalleKm && !intervalleJours) {
      return ResponseHandler.badRequest(
        res,
        "Au moins un intervalle (km ou jours) doit être défini"
      );
    }

    const existingRule = await MaintenanceRule.findOne({ nom });
    if (existingRule) {
      return ResponseHandler.badRequest(
        res,
        "Une règle avec ce nom existe déjà"
      );
    }

    const rule = await MaintenanceRule.create({
      nom,
      type,
      typeAlerte,
      description,
      intervalleKm: intervalleKm || 0,
      intervalleJours: intervalleJours || 0,
      seuilAlerteKm: seuilAlerteKm || 1000,
      seuilAlerteJours: seuilAlerteJours || 7,
      vehiculeTypes: vehiculeTypes || ["Camion", "Remorque"],
      actif: actif !== undefined ? actif : true,
      creePar: req.user._id,
    });

    const populatedRule = await MaintenanceRule.findById(rule._id).populate(
      "creePar",
      "nom prenom email"
    );

    return ResponseHandler.created(
      res,
      { rule: populatedRule },
      "Règle de maintenance créée avec succès"
    );
  } catch (error) {
    console.error("Create rule error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return ResponseHandler.badRequest(res, "Erreur de validation", errors);
    }

    if (error.code === 11000) {
      return ResponseHandler.badRequest(
        res,
        "Une règle avec ce nom existe déjà"
      );
    }

    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la création de la règle"
    );
  }
};

// Update maintenance rule
exports.updateRule = async (req, res) => {
  try {
    const {
      nom,
      type,
      typeAlerte,
      description,
      intervalleKm,
      intervalleJours,
      seuilAlerteKm,
      seuilAlerteJours,
      vehiculeTypes,
      actif,
    } = req.body;

    const rule = await MaintenanceRule.findById(req.params.id);

    if (!rule) {
      return ResponseHandler.notFound(res, "Règle de maintenance non trouvée");
    }

    if (nom) rule.nom = nom;
    if (type) rule.type = type;
    if (typeAlerte) rule.typeAlerte = typeAlerte;
    if (description !== undefined) rule.description = description;
    if (intervalleKm !== undefined) rule.intervalleKm = intervalleKm;
    if (intervalleJours !== undefined) rule.intervalleJours = intervalleJours;
    if (seuilAlerteKm !== undefined) rule.seuilAlerteKm = seuilAlerteKm;
    if (seuilAlerteJours !== undefined)
      rule.seuilAlerteJours = seuilAlerteJours;
    if (vehiculeTypes) rule.vehiculeTypes = vehiculeTypes;
    if (actif !== undefined) rule.actif = actif;

    await rule.save();

    const updatedRule = await MaintenanceRule.findById(rule._id).populate(
      "creePar",
      "nom prenom email"
    );

    return ResponseHandler.success(
      res,
      { rule: updatedRule },
      "Règle mise à jour avec succès"
    );
  } catch (error) {
    console.error("Update rule error:", error);

    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID invalide");
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return ResponseHandler.badRequest(res, "Erreur de validation", errors);
    }

    if (error.code === 11000) {
      return ResponseHandler.badRequest(
        res,
        "Une règle avec ce nom existe déjà"
      );
    }

    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la mise à jour de la règle"
    );
  }
};


exports.deleteRule = async (req, res) => {
  try {
    const rule = await MaintenanceRule.findById(req.params.id);

    if (!rule) {
      return ResponseHandler.notFound(res, "Règle de maintenance non trouvée");
    }

    await MaintenanceRule.findByIdAndDelete(req.params.id);

    return ResponseHandler.success(
      res,
      { rule },
      "Règle supprimée avec succès"
    );
  } catch (error) {
    console.error("Delete rule error:", error);

    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID de règle invalide");
    }

    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la suppression de la règle"
    );
  }
};

exports.toggleRuleStatus = async (req, res) => {
  try {
    const rule = await MaintenanceRule.findById(req.params.id);

    if (!rule) {
      return ResponseHandler.notFound(res, "Règle de maintenance non trouvée");
    }

    rule.actif = !rule.actif;
    await rule.save();

    const updatedRule = await MaintenanceRule.findById(rule._id).populate(
      "creePar",
      "nom prenom email"
    );

    return ResponseHandler.success(
      res,
      { rule: updatedRule },
      `Règle ${rule.actif ? "activée" : "désactivée"} avec succès`
    );
  } catch (error) {
    console.error("Toggle rule status error:", error);

    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID de règle invalide");
    }

    return ResponseHandler.error(
      res,
      error.message || "Erreur lors du changement de statut de la règle"
    );
  }
};
