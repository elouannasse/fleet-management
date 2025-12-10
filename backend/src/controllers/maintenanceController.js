const Maintenance = require("../models/Maintenance");
const MaintenanceAlert = require("../models/MaintenanceAlert");
const Camion = require("../models/Camion");
const Remorque = require("../models/Remorque");
const ResponseHandler = require("../utils/responseHandler");
const {
  MAINTENANCE_STATUS,
  MAINTENANCE_TYPES,
  VEHICULE_STATUS,
} = require("../utils/constants");


exports.getAllMaintenances = async (req, res) => {
  try {
    const {
      vehicule,
      vehiculeType,
      type,
      statut,
      priorite,
      dateDebut,
      dateFin,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};
    if (vehicule) filter.vehicule = vehicule;
    if (vehiculeType) filter.vehiculeType = vehiculeType;
    if (type) filter.type = type;
    if (statut) filter.statut = statut;
    if (priorite) filter.priorite = priorite;

    if (dateDebut || dateFin) {
      filter.datePrevue = {};
      if (dateDebut) filter.datePrevue.$gte = new Date(dateDebut);
      if (dateFin) filter.datePrevue.$lte = new Date(dateFin);
    }

    const skip = (page - 1) * limit;

    const maintenances = await Maintenance.find(filter)
      .populate("vehicule", "matricule marque modele kilometrage statut")
      .populate("creePar", "nom prenom email")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ datePrevue: -1 });

    const total = await Maintenance.countDocuments(filter);

    return ResponseHandler.success(
      res,
      {
        maintenances,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
      },
      "Maintenances récupérées avec succès"
    );
  } catch (error) {
    console.error("Get all maintenances error:", error);
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la récupération des maintenances"
    );
  }
};


exports.getMaintenanceById = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate("vehicule", "matricule marque modele kilometrage statut")
      .populate("creePar", "nom prenom email");

    if (!maintenance) {
      return ResponseHandler.notFound(res, "Maintenance non trouvée");
    }

    return ResponseHandler.success(
      res,
      { maintenance },
      "Maintenance récupérée avec succès"
    );
  } catch (error) {
    console.error("Get maintenance by ID error:", error);
    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID de maintenance invalide");
    }
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la récupération de la maintenance"
    );
  }
};


exports.getMaintenancesByVehicule = async (req, res) => {
  try {
    const { vehiculeType, vehiculeId } = req.params;

    if (!["Camion", "Remorque"].includes(vehiculeType)) {
      return ResponseHandler.badRequest(
        res,
        'Type de véhicule invalide. Utilisez "Camion" ou "Remorque"'
      );
    }

    const VehicleModel = vehiculeType === "Camion" ? Camion : Remorque;
    const vehicleExists = await VehicleModel.findById(vehiculeId);

    if (!vehicleExists) {
      return ResponseHandler.notFound(res, `${vehiculeType} non trouvé`);
    }

    const maintenances = await Maintenance.find({
      vehiculeType,
      vehicule: vehiculeId,
    })
      .populate("creePar", "nom prenom email")
      .sort({ datePrevue: -1 });

    const stats = {
      total: maintenances.length,
      planifiees: maintenances.filter(
        (m) => m.statut === MAINTENANCE_STATUS.PLANIFIEE
      ).length,
      enCours: maintenances.filter(
        (m) => m.statut === MAINTENANCE_STATUS.EN_COURS
      ).length,
      terminees: maintenances.filter(
        (m) => m.statut === MAINTENANCE_STATUS.TERMINEE
      ).length,
      coutTotal: maintenances.reduce((sum, m) => sum + m.coutTotal, 0),
    };

    return ResponseHandler.success(
      res,
      {
        maintenances,
        vehicule: vehicleExists,
        stats,
      },
      "Maintenances du véhicule récupérées avec succès"
    );
  } catch (error) {
    console.error("Get maintenances by vehicle error:", error);
    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID de véhicule invalide");
    }
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la récupération des maintenances"
    );
  }
};

exports.createMaintenance = async (req, res) => {
  try {
    const {
      vehiculeType,
      vehicule,
      type,
      description,
      priorite,
      kilometrageActuel,
      datePrevue,
      cout,
      pieces,
      mainDoeuvre,
      technicien,
      garage,
      remarques,
    } = req.body;

    if (
      !vehiculeType ||
      !vehicule ||
      !type ||
      !description ||
      !kilometrageActuel ||
      !datePrevue
    ) {
      return ResponseHandler.badRequest(
        res,
        "Veuillez fournir tous les champs obligatoires"
      );
    }

    if (!["Camion", "Remorque"].includes(vehiculeType)) {
      return ResponseHandler.badRequest(
        res,
        'Type de véhicule invalide. Utilisez "Camion" ou "Remorque"'
      );
    }

    const VehicleModel = vehiculeType === "Camion" ? Camion : Remorque;
    const vehicleExists = await VehicleModel.findById(vehicule);

    if (!vehicleExists) {
      return ResponseHandler.notFound(res, `${vehiculeType} non trouvé`);
    }

    const maintenance = await Maintenance.create({
      vehiculeType,
      vehicule,
      type,
      description,
      priorite,
      kilometrageActuel,
      datePrevue,
      cout: cout || 0,
      pieces: pieces || [],
      mainDoeuvre: mainDoeuvre || 0,
      technicien,
      garage,
      remarques,
      creePar: req.user._id,
    });

    const populatedMaintenance = await Maintenance.findById(maintenance._id)
      .populate("vehicule", "matricule marque modele")
      .populate("creePar", "nom prenom email");

    return ResponseHandler.created(
      res,
      { maintenance: populatedMaintenance },
      "Maintenance créée avec succès"
    );
  } catch (error) {
    console.error("Create maintenance error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return ResponseHandler.badRequest(res, "Erreur de validation", errors);
    }

    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la création de la maintenance"
    );
  }
};

exports.updateMaintenance = async (req, res) => {
  try {
    const {
      type,
      description,
      statut,
      priorite,
      datePrevue,
      dateDebut,
      dateFin,
      cout,
      pieces,
      mainDoeuvre,
      technicien,
      garage,
      remarques,
    } = req.body;

    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return ResponseHandler.notFound(res, "Maintenance non trouvée");
    }

    // Update fields
    if (type) maintenance.type = type;
    if (description) maintenance.description = description;
    if (statut) maintenance.statut = statut;
    if (priorite) maintenance.priorite = priorite;
    if (datePrevue) maintenance.datePrevue = datePrevue;
    if (dateDebut) maintenance.dateDebut = dateDebut;
    if (dateFin) maintenance.dateFin = dateFin;
    if (cout !== undefined) maintenance.cout = cout;
    if (pieces) maintenance.pieces = pieces;
    if (mainDoeuvre !== undefined) maintenance.mainDoeuvre = mainDoeuvre;
    if (technicien !== undefined) maintenance.technicien = technicien;
    if (garage !== undefined) maintenance.garage = garage;
    if (remarques !== undefined) maintenance.remarques = remarques;

    // Update vehicle status based on maintenance status
    if (statut === MAINTENANCE_STATUS.EN_COURS) {
      const VehicleModel =
        maintenance.vehiculeType === "Camion" ? Camion : Remorque;
      await VehicleModel.findByIdAndUpdate(maintenance.vehicule, {
        statut: VEHICULE_STATUS.EN_MAINTENANCE,
      });
    } else if (statut === MAINTENANCE_STATUS.TERMINEE) {
      const VehicleModel =
        maintenance.vehiculeType === "Camion" ? Camion : Remorque;
      await VehicleModel.findByIdAndUpdate(maintenance.vehicule, {
        statut: VEHICULE_STATUS.DISPONIBLE,
        derniereMaintenance: new Date(),
      });
    }

    await maintenance.save();

    const updatedMaintenance = await Maintenance.findById(maintenance._id)
      .populate("vehicule", "matricule marque modele")
      .populate("creePar", "nom prenom email");

    return ResponseHandler.success(
      res,
      { maintenance: updatedMaintenance },
      "Maintenance mise à jour avec succès"
    );
  } catch (error) {
    console.error("Update maintenance error:", error);

    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID invalide");
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return ResponseHandler.badRequest(res, "Erreur de validation", errors);
    }

    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la mise à jour de la maintenance"
    );
  }
};

exports.deleteMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return ResponseHandler.notFound(res, "Maintenance non trouvée");
    }

    // Don't allow deletion of in-progress maintenance
    if (maintenance.statut === MAINTENANCE_STATUS.EN_COURS) {
      return ResponseHandler.badRequest(
        res,
        "Impossible de supprimer une maintenance en cours"
      );
    }

    await Maintenance.findByIdAndDelete(req.params.id);

    return ResponseHandler.success(
      res,
      { maintenance },
      "Maintenance supprimée avec succès"
    );
  } catch (error) {
    console.error("Delete maintenance error:", error);

    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID de maintenance invalide");
    }

    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la suppression de la maintenance"
    );
  }
};

exports.getMaintenanceStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.datePrevue = {};
      if (startDate) filter.datePrevue.$gte = new Date(startDate);
      if (endDate) filter.datePrevue.$lte = new Date(endDate);
    }

    const maintenances = await Maintenance.find(filter);

    const stats = {
      total: maintenances.length,
      parStatut: {
        planifiees: maintenances.filter(
          (m) => m.statut === MAINTENANCE_STATUS.PLANIFIEE
        ).length,
        enCours: maintenances.filter(
          (m) => m.statut === MAINTENANCE_STATUS.EN_COURS
        ).length,
        terminees: maintenances.filter(
          (m) => m.statut === MAINTENANCE_STATUS.TERMINEE
        ).length,
        annulees: maintenances.filter(
          (m) => m.statut === MAINTENANCE_STATUS.ANNULEE
        ).length,
      },
      parType: {
        pneu: maintenances.filter((m) => m.type === MAINTENANCE_TYPES.PNEU)
          .length,
        vidange: maintenances.filter(
          (m) => m.type === MAINTENANCE_TYPES.VIDANGE
        ).length,
        revision: maintenances.filter(
          (m) => m.type === MAINTENANCE_TYPES.REVISION
        ).length,
        reparation: maintenances.filter(
          (m) => m.type === MAINTENANCE_TYPES.REPARATION
        ).length,
      },
      couts: {
        total: maintenances.reduce((sum, m) => sum + m.coutTotal, 0),
        moyen:
          maintenances.length > 0
            ? maintenances.reduce((sum, m) => sum + m.coutTotal, 0) /
              maintenances.length
            : 0,
        parType: {
          pneu: maintenances
            .filter((m) => m.type === MAINTENANCE_TYPES.PNEU)
            .reduce((sum, m) => sum + m.coutTotal, 0),
          vidange: maintenances
            .filter((m) => m.type === MAINTENANCE_TYPES.VIDANGE)
            .reduce((sum, m) => sum + m.coutTotal, 0),
          revision: maintenances
            .filter((m) => m.type === MAINTENANCE_TYPES.REVISION)
            .reduce((sum, m) => sum + m.coutTotal, 0),
          reparation: maintenances
            .filter((m) => m.type === MAINTENANCE_TYPES.REPARATION)
            .reduce((sum, m) => sum + m.coutTotal, 0),
        },
      },
    };

    return ResponseHandler.success(
      res,
      { stats },
      "Statistiques de maintenance récupérées avec succès"
    );
  } catch (error) {
    console.error("Get maintenance stats error:", error);
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la récupération des statistiques"
    );
  }
};
