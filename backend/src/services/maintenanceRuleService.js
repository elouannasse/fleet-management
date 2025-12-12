const MaintenanceRule = require("../models/MaintenanceRule");
const Camion = require("../models/Camion");
const Remorque = require("../models/Remorque");


const getAllRules = async (filters = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const query = {};

  if (filters.typeAlerte) query.typeAlerte = filters.typeAlerte;
  if (filters.actif !== undefined) query.actif = filters.actif === "true";
  if (filters.vehiculeTypes) {
    query.vehiculeTypes = { $in: filters.vehiculeTypes.split(",") };
  }

  const rules = await MaintenanceRule.find(query)
    .populate("creePar", "nom prenom email")
    .sort({ dateCreation: -1 })
    .skip(skip)
    .limit(limit);

  const total = await MaintenanceRule.countDocuments(query);

  return {
    rules,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  };
};


const getRuleById = async (id) => {
  const rule = await MaintenanceRule.findById(id).populate(
    "creePar",
    "nom prenom email"
  );

  if (!rule) {
    throw new Error("Règle de maintenance non trouvée");
  }

  return rule;
};


const createRule = async (data, userId) => {
  
  const existingRule = await MaintenanceRule.findOne({ nom: data.nom });
  if (existingRule) {
    throw new Error("Une règle avec ce nom existe déjà");
  }

  const ruleData = {
    ...data,
    creePar: userId,
    actif: data.actif !== false, 
  };

  const rule = await MaintenanceRule.create(ruleData);
  return rule.populate("creePar", "nom prenom email");
};


const updateRule = async (id, data) => {
 
  if (data.nom) {
    const existingRule = await MaintenanceRule.findOne({
      nom: data.nom,
      _id: { $ne: id },
    });
    if (existingRule) {
      throw new Error("Une règle avec ce nom existe déjà");
    }
  }

  const rule = await MaintenanceRule.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate("creePar", "nom prenom email");

  if (!rule) {
    throw new Error("Règle de maintenance non trouvée");
  }

  return rule;
};


const deleteRule = async (id) => {
  const rule = await MaintenanceRule.findById(id);

  if (!rule) {
    throw new Error("Règle de maintenance non trouvée");
  }

  await rule.deleteOne();
  return { message: "Règle de maintenance supprimée avec succès" };
};


const toggleRuleStatus = async (id) => {
  const rule = await MaintenanceRule.findById(id);

  if (!rule) {
    throw new Error("Règle de maintenance non trouvée");
  }

  rule.actif = !rule.actif;
  await rule.save();

  return rule.populate("creePar", "nom prenom email");
};


const checkAndGenerateAlerts = async () => {
  
  const activeRules = await MaintenanceRule.find({ actif: true });

  if (activeRules.length === 0) {
    return { alertes: [], count: 0 };
  }

  const alertes = [];

 
  for (const rule of activeRules) {
   
    const vehicules = [];

    if (rule.vehiculeTypes.includes("Camion")) {
      const camions = await Camion.find({ statut: { $ne: "hors service" } });
      vehicules.push(
        ...camions.map((c) => ({ ...c.toObject(), type: "Camion" }))
      );
    }

    if (rule.vehiculeTypes.includes("Remorque")) {
      const remorques = await Remorque.find({
        statut: { $ne: "hors service" },
      });
      vehicules.push(
        ...remorques.map((r) => ({ ...r.toObject(), type: "Remorque" }))
      );
    }

   
    for (const vehicule of vehicules) {
      const alerteData = {
        ruleId: rule._id,
        ruleName: rule.nom,
        vehiculeType: vehicule.type,
        vehiculeId: vehicule._id,
        vehiculeMatricule: vehicule.matricule,
        typeAlerte: rule.typeAlerte,
        priorite: rule.priorite,
        description: rule.description,
      };

      let shouldAlert = false;

      
      if (rule.typeAlerte === "kilometrage" || rule.typeAlerte === "mixte") {
        if (rule.intervalleKm && rule.seuilAlerteKm) {
          const kmParcourus =
            (vehicule.kilometrage || 0) - (vehicule.lastMaintenanceKm || 0);
          const kmAvantMaintenance = rule.intervalleKm - rule.seuilAlerteKm;

          if (kmParcourus >= kmAvantMaintenance) {
            shouldAlert = true;
            alerteData.kmParcourus = kmParcourus;
            alerteData.kmAvantMaintenance = kmAvantMaintenance;
            alerteData.message = `Le véhicule ${vehicule.matricule} a parcouru ${kmParcourus} km (seuil: ${kmAvantMaintenance} km)`;
          }
        }
      }

      if (rule.typeAlerte === "temporel" || rule.typeAlerte === "mixte") {
        if (rule.intervalleJours && rule.seuilAlerteJours) {
          const derniereMaintenanceDate = vehicule.derniereMaintenance
            ? new Date(vehicule.derniereMaintenance)
            : new Date(vehicule.dateAcquisition || Date.now());

          const joursDepuis = Math.floor(
            (Date.now() - derniereMaintenanceDate) / (1000 * 60 * 60 * 24)
          );
          const joursAvantMaintenance =
            rule.intervalleJours - rule.seuilAlerteJours;

          if (joursDepuis >= joursAvantMaintenance) {
            shouldAlert = true;
            alerteData.joursDepuis = joursDepuis;
            alerteData.joursAvantMaintenance = joursAvantMaintenance;

            if (!alerteData.message) {
              alerteData.message = `Le véhicule ${vehicule.matricule} n'a pas été entretenu depuis ${joursDepuis} jours (seuil: ${joursAvantMaintenance} jours)`;
            } else {
              alerteData.message += ` et n'a pas été entretenu depuis ${joursDepuis} jours (seuil: ${joursAvantMaintenance} jours)`;
            }
          }
        }
      }

      if (shouldAlert) {
        alertes.push(alerteData);
      }
    }
  }

  return {
    alertes,
    count: alertes.length,
  };
};

module.exports = {
  getAllRules,
  getRuleById,
  createRule,
  updateRule,
  deleteRule,
  toggleRuleStatus,
  checkAndGenerateAlerts,
};
