const Camion = require("../models/Camion");
const Remorque = require("../models/Remorque");
const Maintenance = require("../models/Maintenance");
const MaintenanceAlert = require("../models/MaintenanceAlert");
const Pneu = require("../models/Pneu");
const ResponseHandler = require("../utils/responseHandler");

// Get consumption report
exports.getConsumptionReport = async (req, res) => {
  try {
    const { startDate, endDate, vehiculeType } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Get all maintenances with costs
    const maintenances = await Maintenance.find(filter).populate(
      "vehicule",
      "matricule marque modele vehiculeType"
    );

    // Group by vehicle type
    const camionMaintenances = maintenances.filter(
      (m) => m.vehiculeType === "Camion"
    );
    const remorqueMaintenances = maintenances.filter(
      (m) => m.vehiculeType === "Remorque"
    );

    const report = {
      periode: {
        debut: startDate || "Début",
        fin: endDate || "Aujourd'hui",
      },
      totaux: {
        depensesTotales: maintenances.reduce((sum, m) => sum + m.coutTotal, 0),
        nombreMaintenances: maintenances.length,
        depensesMoyennesParMaintenance:
          maintenances.length > 0
            ? maintenances.reduce((sum, m) => sum + m.coutTotal, 0) /
              maintenances.length
            : 0,
      },
      parTypeVehicule: {
        camions: {
          nombre: camionMaintenances.length,
          depensesTotales: camionMaintenances.reduce(
            (sum, m) => sum + m.coutTotal,
            0
          ),
          depensesMoyennes:
            camionMaintenances.length > 0
              ? camionMaintenances.reduce((sum, m) => sum + m.coutTotal, 0) /
                camionMaintenances.length
              : 0,
        },
        remorques: {
          nombre: remorqueMaintenances.length,
          depensesTotales: remorqueMaintenances.reduce(
            (sum, m) => sum + m.coutTotal,
            0
          ),
          depensesMoyennes:
            remorqueMaintenances.length > 0
              ? remorqueMaintenances.reduce((sum, m) => sum + m.coutTotal, 0) /
                remorqueMaintenances.length
              : 0,
        },
      },
      parTypeMaintenance: {
        pneu: {
          nombre: maintenances.filter((m) => m.type === "pneu").length,
          cout: maintenances
            .filter((m) => m.type === "pneu")
            .reduce((sum, m) => sum + m.coutTotal, 0),
        },
        vidange: {
          nombre: maintenances.filter((m) => m.type === "vidange").length,
          cout: maintenances
            .filter((m) => m.type === "vidange")
            .reduce((sum, m) => sum + m.coutTotal, 0),
        },
        revision: {
          nombre: maintenances.filter((m) => m.type === "revision").length,
          cout: maintenances
            .filter((m) => m.type === "revision")
            .reduce((sum, m) => sum + m.coutTotal, 0),
        },
        reparation: {
          nombre: maintenances.filter((m) => m.type === "reparation").length,
          cout: maintenances
            .filter((m) => m.type === "reparation")
            .reduce((sum, m) => sum + m.coutTotal, 0),
        },
      },
    };

    return ResponseHandler.success(
      res,
      { report },
      "Rapport de consommation généré avec succès"
    );
  } catch (error) {
    console.error("Get consumption report error:", error);
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la génération du rapport de consommation"
    );
  }
};

// Get mileage report
exports.getKilometrageReport = async (req, res) => {
  try {
    const { vehiculeType } = req.query;

    // Get all camions
    const camions = await Camion.find()
      .populate("pneus", "etat position")
      .sort({ kilometrage: -1 });

    // Get all remorques
    const remorques = await Remorque.find()
      .populate("pneus", "etat position")
      .sort({ createdAt: -1 });

    const camionsData = camions.map((c) => ({
      _id: c._id,
      matricule: c.matricule,
      marque: c.marque,
      modele: c.modele,
      kilometrage: c.kilometrage,
      statut: c.statut,
      derniereMaintenance: c.derniereMaintenance,
      prochaineMaintenance: c.prochaineMaintenance,
      nombrePneus: c.pneus.length,
      pneusARemplacer: c.pneus.filter((p) => p.etat === "à remplacer").length,
    }));

    const remorquesData = remorques.map((r) => ({
      _id: r._id,
      matricule: r.matricule,
      type: r.type,
      statut: r.statut,
      derniereMaintenance: r.derniereMaintenance,
      prochaineMaintenance: r.prochaineMaintenance,
      nombrePneus: r.pneus.length,
      pneusARemplacer: r.pneus.filter((p) => p.etat === "à remplacer").length,
    }));

    const report = {
      camions: {
        total: camions.length,
        kilometrageMoyen:
          camions.length > 0
            ? camions.reduce((sum, c) => sum + (c.kilometrage || 0), 0) /
              camions.length
            : 0,
        kilometrageTotal: camions.reduce(
          (sum, c) => sum + (c.kilometrage || 0),
          0
        ),
        kilometrageMax: camions.length > 0 ? camions[0].kilometrage : 0,
        vehicules: camionsData,
      },
      remorques: {
        total: remorques.length,
        vehicules: remorquesData,
      },
      statistiques: {
        vehiculesTotalDisponibles: [...camions, ...remorques].filter(
          (v) => v.statut === "disponible"
        ).length,
        vehiculesTotalEnService: [...camions, ...remorques].filter(
          (v) => v.statut === "en service"
        ).length,
        vehiculesTotalEnMaintenance: [...camions, ...remorques].filter(
          (v) => v.statut === "en maintenance"
        ).length,
        vehiculesTotalHorsService: [...camions, ...remorques].filter(
          (v) => v.statut === "hors service"
        ).length,
      },
    };

    return ResponseHandler.success(
      res,
      { report },
      "Rapport de kilométrage généré avec succès"
    );
  } catch (error) {
    console.error("Get kilometrage report error:", error);
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la génération du rapport de kilométrage"
    );
  }
};

// Get maintenance report
exports.getMaintenanceReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.datePrevue = {};
      if (startDate) filter.datePrevue.$gte = new Date(startDate);
      if (endDate) filter.datePrevue.$lte = new Date(endDate);
    }

    const maintenances = await Maintenance.find(filter)
      .populate("vehicule", "matricule marque modele")
      .sort({ datePrevue: -1 });

    const alerts = await MaintenanceAlert.find({ traitee: false })
      .populate("vehicule", "matricule marque modele")
      .populate("regle", "nom type")
      .sort({ dateGeneree: -1 });

    // Group maintenances by status
    const planifiees = maintenances.filter((m) => m.statut === "planifiée");
    const enCours = maintenances.filter((m) => m.statut === "en cours");
    const terminees = maintenances.filter((m) => m.statut === "terminée");
    const annulees = maintenances.filter((m) => m.statut === "annulée");

    // Group alerts by urgency
    const alertesUrgentes = alerts.filter((a) => a.urgente);
    const alertesNormales = alerts.filter((a) => !a.urgente);

    const report = {
      periode: {
        debut: startDate || "Début",
        fin: endDate || "Aujourd'hui",
      },
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
        annulees: {
          nombre: annulees.length,
        },
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
        normales: {
          nombre: alertesNormales.length,
        },
        nonLues: alerts.filter((a) => !a.lue).length,
        nonTraitees: alerts.filter((a) => !a.traitee).length,
      },
      couts: {
        total: terminees.reduce((sum, m) => sum + m.coutTotal, 0),
        moyen:
          terminees.length > 0
            ? terminees.reduce((sum, m) => sum + m.coutTotal, 0) /
              terminees.length
            : 0,
        parType: {
          pneu: terminees
            .filter((m) => m.type === "pneu")
            .reduce((sum, m) => sum + m.coutTotal, 0),
          vidange: terminees
            .filter((m) => m.type === "vidange")
            .reduce((sum, m) => sum + m.coutTotal, 0),
          revision: terminees
            .filter((m) => m.type === "revision")
            .reduce((sum, m) => sum + m.coutTotal, 0),
          reparation: terminees
            .filter((m) => m.type === "reparation")
            .reduce((sum, m) => sum + m.coutTotal, 0),
        },
      },
    };

    return ResponseHandler.success(
      res,
      { report },
      "Rapport de maintenance généré avec succès"
    );
  } catch (error) {
    console.error("Get maintenance report error:", error);
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la génération du rapport de maintenance"
    );
  }
};

// Get dashboard overview
exports.getDashboardOverview = async (req, res) => {
  try {
    // Count vehicles
    const camionsCount = await Camion.countDocuments();
    const remorquesCount = await Remorque.countDocuments();

    // Count by status
    const camionsDisponibles = await Camion.countDocuments({
      statut: "disponible",
    });
    const camionsEnService = await Camion.countDocuments({
      statut: "en service",
    });
    const camionsEnMaintenance = await Camion.countDocuments({
      statut: "en maintenance",
    });

    // Maintenance stats
    const maintenancesPlanifiees = await Maintenance.countDocuments({
      statut: "planifiée",
    });
    const maintenancesEnCours = await Maintenance.countDocuments({
      statut: "en cours",
    });

    // Alert stats
    const alertesNonTraitees = await MaintenanceAlert.countDocuments({
      traitee: false,
    });
    const alertesUrgentes = await MaintenanceAlert.countDocuments({
      urgente: true,
      traitee: false,
    });

    // Recent maintenances (last 7 days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const maintenancesRecentes = await Maintenance.find({
      createdAt: { $gte: last7Days },
    }).countDocuments();

    // Total costs (last 30 days)
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const maintenancesLast30Days = await Maintenance.find({
      datePrevue: { $gte: last30Days },
      statut: "terminée",
    });
    const coutTotal30Days = maintenancesLast30Days.reduce(
      (sum, m) => sum + m.coutTotal,
      0
    );

    // Pneus stats
    const pneusTotal = await Pneu.countDocuments();
    const pneusARemplacer = await Pneu.countDocuments({ etat: "à remplacer" });
    const pneusUse = await Pneu.countDocuments({ etat: "usé" });

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
        pourcentageARemplacer:
          pneusTotal > 0
            ? ((pneusARemplacer / pneusTotal) * 100).toFixed(2)
            : 0,
      },
    };

    return ResponseHandler.success(
      res,
      { overview },
      "Vue d'ensemble récupérée avec succès"
    );
  } catch (error) {
    console.error("Get dashboard overview error:", error);
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la récupération de la vue d'ensemble"
    );
  }
};

// Get vehicle details report
exports.getVehiculeDetailsReport = async (req, res) => {
  try {
    const { vehiculeType, vehiculeId } = req.params;

    if (!["Camion", "Remorque"].includes(vehiculeType)) {
      return ResponseHandler.badRequest(
        res,
        'Type de véhicule invalide. Utilisez "Camion" ou "Remorque"'
      );
    }

    const VehicleModel = vehiculeType === "Camion" ? Camion : Remorque;
    const vehicule = await VehicleModel.findById(vehiculeId).populate("pneus");

    if (!vehicule) {
      return ResponseHandler.notFound(res, `${vehiculeType} non trouvé`);
    }

    // Get maintenances for this vehicle
    const maintenances = await Maintenance.find({
      vehiculeType,
      vehicule: vehiculeId,
    }).sort({ datePrevue: -1 });

    // Get alerts for this vehicle
    const alerts = await MaintenanceAlert.find({
      vehiculeType,
      vehicule: vehiculeId,
      traitee: false,
    }).populate("regle", "nom type");

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
        total: vehicule.pneus.length,
        neufs: vehicule.pneus.filter((p) => p.etat === "neuf").length,
        bons: vehicule.pneus.filter((p) => p.etat === "bon").length,
        moyens: vehicule.pneus.filter((p) => p.etat === "moyen").length,
        uses: vehicule.pneus.filter((p) => p.etat === "usé").length,
        aRemplacer: vehicule.pneus.filter((p) => p.etat === "à remplacer")
          .length,
        liste: vehicule.pneus.map((p) => ({
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
        coutTotal: maintenances
          .filter((m) => m.statut === "terminée")
          .reduce((sum, m) => sum + m.coutTotal, 0),
        derniere:
          maintenances.length > 0
            ? {
                type: maintenances[0].type,
                date: maintenances[0].datePrevue,
                statut: maintenances[0].statut,
                cout: maintenances[0].coutTotal,
              }
            : null,
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

    return ResponseHandler.success(
      res,
      { report },
      "Rapport détaillé du véhicule généré avec succès"
    );
  } catch (error) {
    console.error("Get vehicle details report error:", error);
    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID de véhicule invalide");
    }
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la génération du rapport détaillé"
    );
  }
};

module.exports = exports;
