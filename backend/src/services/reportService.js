const Maintenance = require("../models/Maintenance");
const Camion = require("../models/Camion");
const Remorque = require("../models/Remorque");
const MaintenanceAlert = require("../models/MaintenanceAlert");


const buildDateFilter = (startDate, endDate, field = "createdAt") => {
  const filter = {};
  if (startDate || endDate) {
    filter[field] = {};
    if (startDate) filter[field].$gte = new Date(startDate);
    if (endDate) filter[field].$lte = new Date(endDate);
  }
  return filter;
};


const groupByVehiculeType = (maintenances) => {
  return {
    camions: maintenances.filter((m) => m.vehiculeType === "Camion"),
    remorques: maintenances.filter((m) => m.vehiculeType === "Remorque"),
  };
};


const calculateCostStats = (items) => {
  const total = items.reduce((sum, item) => sum + (item.coutTotal || 0), 0);
  const count = items.length;
  const average = count > 0 ? total / count : 0;

  return {
    nombre: count,
    depensesTotales: parseFloat(total.toFixed(2)),
    depensesMoyennes: parseFloat(average.toFixed(2)),
  };
};


const groupByMaintenanceType = (maintenances) => {
  const types = ["pneu", "vidange", "revision", "reparation"];
  const grouped = {};

  types.forEach((type) => {
    const filtered = maintenances.filter((m) => m.type === type);
    grouped[type] = {
      nombre: filtered.length,
      cout: parseFloat(
        filtered.reduce((sum, m) => sum + m.coutTotal, 0).toFixed(2)
      ),
    };
  });

  return grouped;
};


const transformCamionData = (camion) => {
  return {
    _id: camion._id,
    matricule: camion.matricule,
    marque: camion.marque,
    modele: camion.modele,
    kilometrage: camion.kilometrage,
    statut: camion.statut,
    derniereMaintenance: camion.derniereMaintenance,
    prochaineMaintenance: camion.prochaineMaintenance,
    nombrePneus: camion.pneus?.length || 0,
    pneusARemplacer:
      camion.pneus?.filter((p) => p.etat === "à remplacer").length || 0,
  };
};


const transformRemorqueData = (remorque) => {
  return {
    _id: remorque._id,
    matricule: remorque.matricule,
    type: remorque.type,
    statut: remorque.statut,
    derniereMaintenance: remorque.derniereMaintenance,
    prochaineMaintenance: remorque.prochaineMaintenance,
    nombrePneus: remorque.pneus?.length || 0,
    pneusARemplacer:
      remorque.pneus?.filter((p) => p.etat === "à remplacer").length || 0,
  };
};


const calculateVehiculeStats = (camions, remorques) => {
  const allVehicules = [...camions, ...remorques];

  return {
    vehiculesTotalDisponibles: allVehicules.filter(
      (v) => v.statut === "disponible"
    ).length,
    vehiculesTotalEnService: allVehicules.filter(
      (v) => v.statut === "en service"
    ).length,
    vehiculesTotalEnMaintenance: allVehicules.filter(
      (v) => v.statut === "en maintenance"
    ).length,
    vehiculesTotalHorsService: allVehicules.filter(
      (v) => v.statut === "hors service"
    ).length,
  };
};


const calculateKilometrageStats = (camions) => {
  const totalKm = camions.reduce((sum, c) => sum + (c.kilometrage || 0), 0);
  const count = camions.length;

  return {
    total: count,
    kilometrageMoyen: count > 0 ? parseFloat((totalKm / count).toFixed(2)) : 0,
    kilometrageTotal: totalKm,
    kilometrageMax: count > 0 ? camions[0]?.kilometrage || 0 : 0,
  };
};


const getMaintenancesWithFilter = async (filter = {}) => {
  return await Maintenance.find(filter).populate(
    "vehicule",
    "matricule marque modele vehiculeType"
  );
};


const getVehiculesWithRelations = async () => {
  const [camions, remorques] = await Promise.all([
    Camion.find().populate("pneus", "etat position").sort({ kilometrage: -1 }),
    Remorque.find().populate("pneus", "etat position").sort({ createdAt: -1 }),
  ]);

  return { camions, remorques };
};


const countMaintenancesByType = async (filter = {}) => {
  const types = ["pneu", "vidange", "revision", "reparation"];
  const counts = {};

  await Promise.all(
    types.map(async (type) => {
      counts[type] = await Maintenance.countDocuments({ ...filter, type });
    })
  );

  return counts;
};


const getActiveAlerts = async () => {
  return await MaintenanceAlert.find({ statut: "active" })
    .populate("vehicule", "matricule marque modele vehiculeType")
    .populate("regle", "type description")
    .sort({ priorite: 1, dateDetection: -1 });
};

module.exports = {
  buildDateFilter,
  groupByVehiculeType,
  calculateCostStats,
  groupByMaintenanceType,
  transformCamionData,
  transformRemorqueData,
  calculateVehiculeStats,
  calculateKilometrageStats,
  getMaintenancesWithFilter,
  getVehiculesWithRelations,
  countMaintenancesByType,
  getActiveAlerts,
};
