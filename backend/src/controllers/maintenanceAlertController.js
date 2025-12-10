const MaintenanceAlert = require("../models/MaintenanceAlert");
const MaintenanceRule = require("../models/MaintenanceRule");
const Camion = require("../models/Camion");
const Remorque = require("../models/Remorque");
const ResponseHandler = require("../utils/responseHandler");


exports.getAllAlerts = async (req, res) => {
  try {
    const { vehicule, lue, traitee, urgente, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (vehicule) filter.vehicule = vehicule;
    if (lue !== undefined) filter.lue = lue === "true";
    if (traitee !== undefined) filter.traitee = traitee === "true";
    if (urgente !== undefined) filter.urgente = urgente === "true";

    const skip = (page - 1) * limit;

    const alerts = await MaintenanceAlert.find(filter)
      .populate("vehicule", "matricule marque modele kilometrage")
      .populate("regle", "nom type")
      .populate("maintenance", "type statut datePrevue")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ dateGeneree: -1 });

    const total = await MaintenanceAlert.countDocuments(filter);

    const stats = {
      total,
      nonLues: await MaintenanceAlert.countDocuments({ lue: false }),
      nonTraitees: await MaintenanceAlert.countDocuments({ traitee: false }),
      urgentes: await MaintenanceAlert.countDocuments({ urgente: true }),
    };

    return ResponseHandler.success(
      res,
      {
        alerts,
        stats,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
      },
      "Alertes récupérées avec succès"
    );
  } catch (error) {
    console.error("Get all alerts error:", error);
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la récupération des alertes"
    );
  }
};


exports.getAlertById = async (req, res) => {
  try {
    const alert = await MaintenanceAlert.findById(req.params.id)
      .populate("vehicule", "matricule marque modele kilometrage statut")
      .populate("regle", "nom type description intervalleKm intervalleJours")
      .populate("maintenance", "type statut datePrevue description");

    if (!alert) {
      return ResponseHandler.notFound(res, "Alerte non trouvée");
    }

    return ResponseHandler.success(
      res,
      { alert },
      "Alerte récupérée avec succès"
    );
  } catch (error) {
    console.error("Get alert by ID error:", error);
    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID d'alerte invalide");
    }
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la récupération de l'alerte"
    );
  }
};


exports.markAlertAsRead = async (req, res) => {
  try {
    const alert = await MaintenanceAlert.findById(req.params.id);

    if (!alert) {
      return ResponseHandler.notFound(res, "Alerte non trouvée");
    }

    alert.lue = true;
    await alert.save();

    const updatedAlert = await MaintenanceAlert.findById(alert._id)
      .populate("vehicule", "matricule marque modele")
      .populate("regle", "nom type");

    return ResponseHandler.success(
      res,
      { alert: updatedAlert },
      "Alerte marquée comme lue"
    );
  } catch (error) {
    console.error("Mark alert as read error:", error);
    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID d'alerte invalide");
    }
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la mise à jour de l'alerte"
    );
  }
};


exports.markAlertAsTreated = async (req, res) => {
  try {
    const { maintenanceId } = req.body;

    const alert = await MaintenanceAlert.findById(req.params.id);

    if (!alert) {
      return ResponseHandler.notFound(res, "Alerte non trouvée");
    }

    alert.traitee = true;
    alert.lue = true;
    if (maintenanceId) {
      alert.maintenance = maintenanceId;
    }
    await alert.save();

    const updatedAlert = await MaintenanceAlert.findById(alert._id)
      .populate("vehicule", "matricule marque modele")
      .populate("regle", "nom type")
      .populate("maintenance", "type statut datePrevue");

    return ResponseHandler.success(
      res,
      { alert: updatedAlert },
      "Alerte marquée comme traitée"
    );
  } catch (error) {
    console.error("Mark alert as treated error:", error);
    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID invalide");
    }
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la mise à jour de l'alerte"
    );
  }
};


exports.deleteAlert = async (req, res) => {
  try {
    const alert = await MaintenanceAlert.findById(req.params.id);

    if (!alert) {
      return ResponseHandler.notFound(res, "Alerte non trouvée");
    }

    await MaintenanceAlert.findByIdAndDelete(req.params.id);

    return ResponseHandler.success(
      res,
      { alert },
      "Alerte supprimée avec succès"
    );
  } catch (error) {
    console.error("Delete alert error:", error);
    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID d'alerte invalide");
    }
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la suppression de l'alerte"
    );
  }
};


exports.checkAndGenerateAlerts = async (req, res) => {
  try {
    const activeRules = await MaintenanceRule.find({ actif: true });

    if (activeRules.length === 0) {
      return ResponseHandler.success(
        res,
        { alertsGenerated: 0 },
        "Aucune règle active trouvée"
      );
    }

    let alertsGenerated = 0;

  
    const camions = await Camion.find({
      statut: { $ne: "hors service" },
    });

    for (const camion of camions) {
      const applicableRules = activeRules.filter(
        (rule) =>
          !rule.vehiculeTypes.length || rule.vehiculeTypes.includes("Camion")
      );

      for (const rule of applicableRules) {
        const shouldAlert = await checkMaintenanceRule(camion, rule, "Camion");

        if (shouldAlert) {
          const existingAlert = await MaintenanceAlert.findOne({
            vehicule: camion._id,
            vehiculeType: "Camion",
            regle: rule._id,
            traitee: false,
          });

          if (!existingAlert) {
            await createMaintenanceAlert(camion, rule, "Camion");
            alertsGenerated++;
          }
        }
      }
    }

  
    const remorques = await Remorque.find({
      statut: { $ne: "hors service" },
    });

    for (const remorque of remorques) {
      const applicableRules = activeRules.filter(
        (rule) =>
          !rule.vehiculeTypes.length || rule.vehiculeTypes.includes("Remorque")
      );

      for (const rule of applicableRules) {
        const shouldAlert = await checkMaintenanceRule(
          remorque,
          rule,
          "Remorque"
        );

        if (shouldAlert) {
          const existingAlert = await MaintenanceAlert.findOne({
            vehicule: remorque._id,
            vehiculeType: "Remorque",
            regle: rule._id,
            traitee: false,
          });

          if (!existingAlert) {
            await createMaintenanceAlert(remorque, rule, "Remorque");
            alertsGenerated++;
          }
        }
      }
    }

    return ResponseHandler.success(
      res,
      { alertsGenerated },
      `${alertsGenerated} alerte(s) générée(s) avec succès`
    );
  } catch (error) {
    console.error("Check and generate alerts error:", error);
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la génération des alertes"
    );
  }
};


async function checkMaintenanceRule(vehicule, rule, vehiculeType) {
  const currentKm = vehicule.kilometrage || 0;
  const lastMaintenanceDate = vehicule.derniereMaintenance;

 
  if (rule.intervalleKm > 0) {
    const lastMaintenanceKm = vehicule.lastMaintenanceKm || 0;
    const kmSinceLastMaintenance = currentKm - lastMaintenanceKm;

    if (kmSinceLastMaintenance >= rule.intervalleKm - rule.seuilAlerteKm) {
      return true;
    }
  }

 
  if (rule.intervalleJours > 0 && lastMaintenanceDate) {
    const daysSinceLastMaintenance = Math.floor(
      (Date.now() - lastMaintenanceDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (
      daysSinceLastMaintenance >=
      rule.intervalleJours - rule.seuilAlerteJours
    ) {
      return true;
    }
  }

  return false;
}


async function createMaintenanceAlert(vehicule, rule, vehiculeType) {
  const currentKm = vehicule.kilometrage || 0;
  const kmRemaining =
    rule.intervalleKm - (currentKm - (vehicule.lastMaintenanceKm || 0));

  let message = `${rule.nom}: `;

  if (kmRemaining <= 0) {
    message += `Maintenance requise immédiatement (${Math.abs(
      kmRemaining
    )} km de dépassement)`;
  } else if (kmRemaining <= rule.seuilAlerteKm) {
    message += `Maintenance requise dans ${kmRemaining} km`;
  }

  const urgente = kmRemaining <= 0 || kmRemaining <= rule.seuilAlerteKm / 2;

  let dateLimite = null;
  if (rule.intervalleJours > 0 && vehicule.derniereMaintenance) {
    dateLimite = new Date(vehicule.derniereMaintenance);
    dateLimite.setDate(dateLimite.getDate() + rule.intervalleJours);
  }

  await MaintenanceAlert.create({
    vehiculeType,
    vehicule: vehicule._id,
    typeAlerte: rule.typeAlerte,
    regle: rule._id,
    message,
    kilometrageActuel: currentKm,
    kilometragePrevu: (vehicule.lastMaintenanceKm || 0) + rule.intervalleKm,
    dateLimite,
    urgente,
  });
}

module.exports = exports;
