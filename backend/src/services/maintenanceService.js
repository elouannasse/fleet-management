const Maintenance = require("../models/Maintenance");
const Camion = require("../models/Camion");
const Remorque = require("../models/Remorque");

const getAllMaintenances = async (filters = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const query = {};

  if (filters.vehiculeType) query.vehiculeType = filters.vehiculeType;
  if (filters.type) query.type = filters.type;
  if (filters.statut) query.statut = filters.statut;
  if (filters.priorite) query.priorite = filters.priorite;

  if (filters.dateDebut || filters.dateFin) {
    query.datePrevue = {};
    if (filters.dateDebut) query.datePrevue.$gte = new Date(filters.dateDebut);
    if (filters.dateFin) query.datePrevue.$lte = new Date(filters.dateFin);
  }

  const maintenances = await Maintenance.find(query)
    .populate("vehicule")
    .populate("creePar", "nom prenom email")
    .sort({ datePrevue: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Maintenance.countDocuments(query);

  return {
    maintenances,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  };
};

const getMaintenanceById = async (id) => {
  const maintenance = await Maintenance.findById(id)
    .populate("vehicule")
    .populate("creePar", "nom prenom email");

  if (!maintenance) {
    const error = new Error("Maintenance non trouvée");
    error.statusCode = 404;
    throw error;
  }

  return maintenance;
};

const getMaintenancesByVehicule = async (vehiculeType, vehiculeId) => {
  const maintenances = await Maintenance.find({
    vehiculeType,
    vehicule: vehiculeId,
  })
    .populate("creePar", "nom prenom email")
    .sort({ datePrevue: -1 });

  const stats = {
    total: maintenances.length,
    planifiees: maintenances.filter((m) => m.statut === "planifiée").length,
    enCours: maintenances.filter((m) => m.statut === "en cours").length,
    terminees: maintenances.filter((m) => m.statut === "terminée").length,
    annulees: maintenances.filter((m) => m.statut === "annulée").length,
  };

  return { maintenances, stats };
};

const createMaintenance = async (data) => {
  const VehiculeModel = data.vehiculeType === "Camion" ? Camion : Remorque;
  const vehicule = await VehiculeModel.findById(data.vehicule);

  if (!vehicule) {
    const error = new Error(`${data.vehiculeType} non trouvé(e)`);
    error.statusCode = 404;
    throw error;
  }

  const maintenanceData = {
    ...data,
    statut: "planifiée",
  };

  const maintenance = await Maintenance.create(maintenanceData);
  return maintenance.populate("vehicule");
};

const updateMaintenance = async (id, data) => {
  const maintenance = await Maintenance.findById(id);

  if (!maintenance) {
    const error = new Error("Maintenance non trouvée");
    error.statusCode = 404;
    throw error;
  }

  const oldStatut = maintenance.statut;
  const newStatut = data.statut;

  if (oldStatut !== newStatut && newStatut) {
    const VehiculeModel =
      maintenance.vehiculeType === "Camion" ? Camion : Remorque;
    const vehicule = await VehiculeModel.findById(maintenance.vehicule);

    if (vehicule) {
      if (newStatut === "en cours") {
        vehicule.statut = "en maintenance";
        await vehicule.save();
      }

      if (newStatut === "terminée") {
        vehicule.statut = "disponible";
        vehicule.derniereMaintenance = new Date();

        if (data.kilometrageActuel) {
          vehicule.lastMaintenanceKm = data.kilometrageActuel;
        }

        await vehicule.save();
      }
    }
  }

  Object.assign(maintenance, data);
  await maintenance.save();

  return maintenance.populate("vehicule");
};

const deleteMaintenance = async (id) => {
  const maintenance = await Maintenance.findById(id);

  if (!maintenance) {
    throw new Error("Maintenance non trouvée");
  }

  if (maintenance.statut === "en cours") {
    throw new Error("Impossible de supprimer une maintenance en cours");
  }

  await maintenance.deleteOne();
  return { message: "Maintenance supprimée avec succès" };
};

const getMaintenanceStats = async (dateDebut, dateFin) => {
  const query = {};

  if (dateDebut || dateFin) {
    query.datePrevue = {};
    if (dateDebut) query.datePrevue.$gte = new Date(dateDebut);
    if (dateFin) query.datePrevue.$lte = new Date(dateFin);
  }

  const maintenances = await Maintenance.find(query);

  const stats = {
    total: maintenances.length,
    parStatut: {
      planifiees: maintenances.filter((m) => m.statut === "planifiée").length,
      enCours: maintenances.filter((m) => m.statut === "en cours").length,
      terminees: maintenances.filter((m) => m.statut === "terminée").length,
      annulees: maintenances.filter((m) => m.statut === "annulée").length,
    },
    parType: {
      preventive: maintenances.filter((m) => m.type === "préventive").length,
      corrective: maintenances.filter((m) => m.type === "corrective").length,
      reparation: maintenances.filter((m) => m.type === "réparation").length,
    },
    parPriorite: {
      basse: maintenances.filter((m) => m.priorite === "basse").length,
      normale: maintenances.filter((m) => m.priorite === "normale").length,
      haute: maintenances.filter((m) => m.priorite === "haute").length,
    },
    parVehicule: {
      camions: maintenances.filter((m) => m.vehiculeType === "Camion").length,
      remorques: maintenances.filter((m) => m.vehiculeType === "Remorque")
        .length,
    },
  };

  const coutTotal = maintenances
    .filter((m) => m.statut === "terminée" && m.cout)
    .reduce((sum, m) => sum + m.cout, 0);

  stats.coutTotal = coutTotal;

  return stats;
};

module.exports = {
  getAllMaintenances,
  getMaintenanceById,
  getMaintenancesByVehicule,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
  getMaintenanceStats,
};
