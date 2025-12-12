const ResponseHandler = require("../utils/responseHandler");
const {
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
} = require("../services/reportService");
const Camion = require("../models/Camion");
const Remorque = require("../models/Remorque");
const Maintenance = require("../models/Maintenance");
const MaintenanceAlert = require("../models/MaintenanceAlert");
const Pneu = require("../models/Pneu");


exports.getConsumptionReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = buildDateFilter(startDate, endDate);
    const maintenances = await getMaintenancesWithFilter(filter);
    const { camions, remorques } = groupByVehiculeType(maintenances);

    const report = {
      periode: { debut: startDate || "Début", fin: endDate || "Aujourd'hui" },
      totaux: calculateCostStats(maintenances),
      parTypeVehicule: {
        camions: calculateCostStats(camions),
        remorques: calculateCostStats(remorques),
      },
      parTypeMaintenance: groupByMaintenanceType(maintenances),
    };

    return ResponseHandler.success(res, { report }, "Rapport de consommation généré avec succès");
  } catch (error) {
    return ResponseHandler.error(res, error.message);
  }
};


exports.getKilometrageReport = async (req, res) => {
  try {
    const { camions, remorques } = await getVehiculesWithRelations();

    const report = {
      camions: {
        ...calculateKilometrageStats(camions),
        vehicules: camions.map(transformCamionData),
      },
      remorques: {
        total: remorques.length,
        vehicules: remorques.map(transformRemorqueData),
      },
      statistiques: calculateVehiculeStats(camions, remorques),
    };

    return ResponseHandler.success(res, { report }, "Rapport de kilométrage généré avec succès");
  } catch (error) {
    return ResponseHandler.error(res, error.message);
  }
};


exports.getMaintenanceReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = buildDateFilter(startDate, endDate, "datePrevue");

    const [maintenances, alerts] = await Promise.all([
      Maintenance.find(filter).populate("vehicule", "matricule marque modele").sort({ datePrevue: -1 }),
      MaintenanceAlert.find({ traitee: false })
        .populate("vehicule", "matricule marque modele")
        .populate("regle", "nom type")
        .sort({ dateGeneree: -1 }),
    ]);

    const planifiees = maintenances.filter((m) => m.statut === "planifiée");
    const enCours = maintenances.filter((m) => m.statut === "en cours");
    const terminees = maintenances.filter((m) => m.statut === "terminée");
    const alertesUrgentes = alerts.filter((a) => a.urgente);

    const report = {
      periode: { debut: startDate || "Début", fin: endDate || "Aujourd'hui" },
      maintenances: {
        total: maintenances.length,
        planifiees: {
          nombre: planifiees.length,
          liste: planifiees.slice(0, 10).map((m) => ({
            _id: m._id,
            vehicule: m.vehicule?.matricule,
            type: m.type,
            datePrevue: m.datePrevue,
            priorite: m.priorite,
          })),
        },
        enCours: {
          nombre: enCours.length,
          liste: enCours.map((m) => ({
            _id: m._id,
            vehicule: m.vehicule?.matricule,
            type: m.type,
            dateDebut: m.dateDebut,
            priorite: m.priorite,
          })),
        },
        terminees: {
          nombre: terminees.length,
          coutTotal: terminees.reduce((sum, m) => sum + m.coutTotal, 0),
        },
        annulees: { nombre: maintenances.filter((m) => m.statut === "annulée").length },
      },
      alertes: {
        total: alerts.length,
        urgentes: {
          nombre: alertesUrgentes.length,
          liste: alertesUrgentes.slice(0, 10).map((a) => ({
            _id: a._id,
            vehicule: a.vehicule?.matricule,
            message: a.message,
            typeAlerte: a.typeAlerte,
            dateGeneree: a.dateGeneree,
          })),
        },
        normales: { nombre: alerts.length - alertesUrgentes.length },
        nonLues: alerts.filter((a) => !a.lue).length,
        nonTraitees: alerts.filter((a) => !a.traitee).length,
      },
      couts: {
        total: terminees.reduce((sum, m) => sum + m.coutTotal, 0),
        moyen: terminees.length > 0 ? terminees.reduce((sum, m) => sum + m.coutTotal, 0) / terminees.length : 0,
        parType: groupByMaintenanceType(terminees),
      },
    };

    return ResponseHandler.success(res, { report }, "Rapport de maintenance généré avec succès");
  } catch (error) {
    return ResponseHandler.error(res, error.message);
  }
};

exports.getDashboardOverview = async (req, res) => {
  try {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const [
      camionsCount, remorquesCount, camionsDisponibles, camionsEnService, camionsEnMaintenance,
      maintenancesPlanifiees, maintenancesEnCours, alertesNonTraitees, alertesUrgentes,
      maintenancesRecentes, maintenancesLast30Days, pneusTotal, pneusARemplacer, pneusUse,
    ] = await Promise.all([
      Camion.countDocuments(),
      Remorque.countDocuments(),
      Camion.countDocuments({ statut: "disponible" }),
      Camion.countDocuments({ statut: "en service" }),
      Camion.countDocuments({ statut: "en maintenance" }),
      Maintenance.countDocuments({ statut: "planifiée" }),
      Maintenance.countDocuments({ statut: "en cours" }),
      MaintenanceAlert.countDocuments({ traitee: false }),
      MaintenanceAlert.countDocuments({ urgente: true, traitee: false }),
      Maintenance.countDocuments({ createdAt: { $gte: last7Days } }),
      Maintenance.find({ datePrevue: { $gte: last30Days }, statut: "terminée" }),
      Pneu.countDocuments(),
      Pneu.countDocuments({ etat: "à remplacer" }),
      Pneu.countDocuments({ etat: "usé" }),
    ]);

    const coutTotal30Days = maintenancesLast30Days.reduce((sum, m) => sum + m.coutTotal, 0);

    const overview = {
      vehicules: {
        total: camionsCount + remorquesCount,
        camions: camionsCount,
        remorques: remorquesCount,
        disponibles: camionsDisponibles,
        enService: camionsEnService,
        enMaintenance: camionsEnMaintenance,
      },
      maintenances: {
        planifiees: maintenancesPlanifiees,
        enCours: maintenancesEnCours,
        recentes7Jours: maintenancesRecentes,
        coutTotal30Jours: coutTotal30Days,
      },
      alertes: {
        total: alertesNonTraitees,
        urgentes: alertesUrgentes,
        normales: alertesNonTraitees - alertesUrgentes,
      },
      pneus: {
        total: pneusTotal,
        aRemplacer: pneusARemplacer,
        uses: pneusUse,
        pourcentageARemplacer: pneusTotal > 0 ? ((pneusARemplacer / pneusTotal) * 100).toFixed(2) : 0,
      },
    };

    return ResponseHandler.success(res, { overview }, "Vue d'ensemble récupérée avec succès");
  } catch (error) {
    return ResponseHandler.error(res, error.message);
  }
};

exports.getVehiculeDetailsReport = async (req, res) => {
  try {
    const { vehiculeType, vehiculeId } = req.params;

    if (!["Camion", "Remorque"].includes(vehiculeType)) {
      return ResponseHandler.badRequest(res, 'Type de véhicule invalide. Utilisez "Camion" ou "Remorque"');
    }

    const VehicleModel = vehiculeType === "Camion" ? Camion : Remorque;
    const vehicule = await VehicleModel.findById(vehiculeId).populate("pneus");

    if (!vehicule) return ResponseHandler.notFound(res, `${vehiculeType} non trouvé`);

    const [maintenances, alerts] = await Promise.all([
      Maintenance.find({ vehiculeType, vehicule: vehiculeId }).sort({ datePrevue: -1 }),
      MaintenanceAlert.find({ vehiculeType, vehicule: vehiculeId, traitee: false }).populate("regle", "nom type"),
    ]);

    const pneus = vehicule.pneus || [];

    const report = {
      vehicule: {
        _id: vehicule._id,
        matricule: vehicule.matricule,
        marque: vehicule.marque,
        modele: vehicule.modele,
        kilometrage: vehicule.kilometrage,
        statut: vehicule.statut,
        derniereMaintenance: vehicule.derniereMaintenance,
        prochaineMaintenance: vehicule.prochaineMaintenance,
      },
      pneus: {
        total: pneus.length,
        neufs: pneus.filter((p) => p.etat === "neuf").length,
        bons: pneus.filter((p) => p.etat === "bon").length,
        moyens: pneus.filter((p) => p.etat === "moyen").length,
        uses: pneus.filter((p) => p.etat === "usé").length,
        aRemplacer: pneus.filter((p) => p.etat === "à remplacer").length,
        liste: pneus.map((p) => ({
          position: p.position,
          marque: p.marque,
          etat: p.etat,
          dateInstallation: p.dateInstallation,
        })),
      },
      maintenances: {
        total: maintenances.length,
        planifiees: maintenances.filter((m) => m.statut === "planifiée").length,
        enCours: maintenances.filter((m) => m.statut === "en cours").length,
        terminees: maintenances.filter((m) => m.statut === "terminée").length,
        coutTotal: maintenances.filter((m) => m.statut === "terminée").reduce((sum, m) => sum + m.coutTotal, 0),
        derniere: maintenances.length > 0 ? {
          type: maintenances[0].type,
          date: maintenances[0].datePrevue,
          statut: maintenances[0].statut,
          cout: maintenances[0].coutTotal,
        } : null,
        historique: maintenances.slice(0, 10).map((m) => ({
          _id: m._id,
          type: m.type,
          description: m.description,
          statut: m.statut,
          datePrevue: m.datePrevue,
          cout: m.coutTotal,
        })),
      },
      alertes: {
        total: alerts.length,
        urgentes: alerts.filter((a) => a.urgente).length,
        liste: alerts.map((a) => ({
          _id: a._id,
          message: a.message,
          typeAlerte: a.typeAlerte,
          urgente: a.urgente,
          dateGeneree: a.dateGeneree,
          regle: a.regle?.nom,
        })),
      },
    };

    return ResponseHandler.success(res, { report }, "Rapport détaillé du véhicule généré avec succès");
  } catch (error) {
    if (error.kind === "ObjectId") return ResponseHandler.badRequest(res, "ID de véhicule invalide");
    return ResponseHandler.error(res, error.message);
  }
};

module.exports = exports;
