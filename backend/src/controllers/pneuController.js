const Pneu = require("../models/Pneu");
const Camion = require("../models/Camion");
const Remorque = require("../models/Remorque");
const ResponseHandler = require("../utils/responseHandler");
const { PNEU_ETAT } = require("../utils/constants");

exports.getAllPneus = async (req, res) => {
  try {
    const { etat, vehiculeType, vehicule, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (etat) filter.etat = etat;
    if (vehiculeType) filter.vehiculeType = vehiculeType;
    if (vehicule) filter.vehicule = vehicule;

    const skip = (page - 1) * limit;

    const pneus = await Pneu.find(filter)
      .populate("vehicule", "matricule marque modele")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Pneu.countDocuments(filter);

    return ResponseHandler.success(
      res,
      {
        pneus,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
      },
      "Pneus récupérés avec succès"
    );
  } catch (error) {
    console.error("Get all pneus error:", error);
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la récupération des pneus"
    );
  }
};

exports.getPneuById = async (req, res) => {
  try {
    const pneu = await Pneu.findById(req.params.id).populate(
      "vehicule",
      "matricule marque modele statut"
    );

    if (!pneu) {
      return ResponseHandler.notFound(res, "Pneu non trouvé");
    }

    return ResponseHandler.success(res, { pneu }, "Pneu récupéré avec succès");
  } catch (error) {
    console.error("Get pneu by ID error:", error);
    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID de pneu invalide");
    }
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la récupération du pneu"
    );
  }
};

exports.getPneusByVehicule = async (req, res) => {
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
      const vehicleName = vehiculeType === "Camion" ? "Camion" : "Remorque";
      return ResponseHandler.notFound(res, `${vehicleName} non trouvé`);
    }

    const pneus = await Pneu.find({
      vehiculeType,
      vehicule: vehiculeId,
    })
      .populate("vehicule", "matricule marque modele")
      .sort({ position: 1 });

    return ResponseHandler.success(
      res,
      {
        pneus,
        count: pneus.length,
        vehicule: vehicleExists,
      },
      "Pneus du véhicule récupérés avec succès"
    );
  } catch (error) {
    console.error("Get pneus by vehicle error:", error);
    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID de véhicule invalide");
    }
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la récupération des pneus du véhicule"
    );
  }
};

exports.createPneu = async (req, res) => {
  try {
    const {
      reference,
      marque,
      dimension,
      position,
      vehiculeType,
      vehicule,
      dateInstallation,
      kilometrageInstallation,
      etat,
      pressionRecommandee,
      remarques,
    } = req.body;

    if (
      !reference ||
      !marque ||
      !dimension ||
      !position ||
      !vehiculeType ||
      !vehicule ||
      !kilometrageInstallation ||
      !pressionRecommandee
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
      const vehicleName = vehiculeType === "Camion" ? "Camion" : "Remorque";
      return ResponseHandler.notFound(res, `${vehicleName} non trouvé`);
    }

    
    const existingPneu = await Pneu.findOne({
      vehiculeType,
      vehicule,
      position,
    });

    if (existingPneu) {
      return ResponseHandler.badRequest(
        res,
        `Un pneu existe déjà à la position "${position}" sur ce véhicule`
      );
    }

    const pneu = await Pneu.create({
      reference,
      marque,
      dimension,
      position,
      vehiculeType,
      vehicule,
      dateInstallation: dateInstallation || Date.now(),
      kilometrageInstallation,
      etat: etat || PNEU_ETAT.NEUF,
      pressionRecommandee,
      remarques,
    });

    await VehicleModel.findByIdAndUpdate(vehicule, {
      $push: { pneus: pneu._id },
    });

    const populatedPneu = await Pneu.findById(pneu._id).populate(
      "vehicule",
      "matricule marque modele"
    );

    return ResponseHandler.created(
      res,
      { pneu: populatedPneu },
      "Pneu créé avec succès"
    );
  } catch (error) {
    console.error("Create pneu error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return ResponseHandler.badRequest(res, "Erreur de validation", errors);
    }

    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la création du pneu"
    );
  }
};

exports.updatePneu = async (req, res) => {
  try {
    const {
      reference,
      marque,
      dimension,
      position,
      vehiculeType,
      vehicule,
      dateInstallation,
      kilometrageInstallation,
      etat,
      pressionRecommandee,
      remarques,
    } = req.body;

    let pneu = await Pneu.findById(req.params.id);

    if (!pneu) {
      return ResponseHandler.notFound(res, "Pneu non trouvé");
    }

    if (vehicule && vehicule !== pneu.vehicule.toString()) {
      const newVehiculeType = vehiculeType || pneu.vehiculeType;
      const VehicleModel = newVehiculeType === "Camion" ? Camion : Remorque;
      const vehicleExists = await VehicleModel.findById(vehicule);

      if (!vehicleExists) {
        return ResponseHandler.notFound(res, `${newVehiculeType} non trouvé`);
      }

      const OldVehicleModel =
        pneu.vehiculeType === "Camion" ? Camion : Remorque;
      await OldVehicleModel.findByIdAndUpdate(pneu.vehicule, {
        $pull: { pneus: pneu._id },
      });

      await VehicleModel.findByIdAndUpdate(vehicule, {
        $push: { pneus: pneu._id },
      });
    }

    if (position && position !== pneu.position) {
      const existingPneu = await Pneu.findOne({
        _id: { $ne: req.params.id },
        vehiculeType: vehiculeType || pneu.vehiculeType,
        vehicule: vehicule || pneu.vehicule,
        position,
      });

      if (existingPneu) {
        return ResponseHandler.badRequest(
          res,
          `Un pneu existe déjà à la position "${position}" sur ce véhicule`
        );
      }
    }

    if (reference) pneu.reference = reference;
    if (marque) pneu.marque = marque;
    if (dimension) pneu.dimension = dimension;
    if (position) pneu.position = position;
    if (vehiculeType) pneu.vehiculeType = vehiculeType;
    if (vehicule) pneu.vehicule = vehicule;
    if (dateInstallation) pneu.dateInstallation = dateInstallation;
    if (kilometrageInstallation !== undefined)
      pneu.kilometrageInstallation = kilometrageInstallation;
    if (etat) pneu.etat = etat;
    if (pressionRecommandee !== undefined)
      pneu.pressionRecommandee = pressionRecommandee;
    if (remarques !== undefined) pneu.remarques = remarques;

    await pneu.save();

    const updatedPneu = await Pneu.findById(pneu._id).populate(
      "vehicule",
      "matricule marque modele"
    );

    return ResponseHandler.success(
      res,
      { pneu: updatedPneu },
      "Pneu mis à jour avec succès"
    );
  } catch (error) {
    console.error("Update pneu error:", error);

    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID invalide");
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return ResponseHandler.badRequest(res, "Erreur de validation", errors);
    }

    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la mise à jour du pneu"
    );
  }
};

exports.updatePneuEtat = async (req, res) => {
  try {
    const { etat } = req.body;

    if (!etat) {
      return ResponseHandler.badRequest(res, "L'état du pneu est requis");
    }

    if (!Object.values(PNEU_ETAT).includes(etat)) {
      return ResponseHandler.badRequest(
        res,
        `État invalide. Utilisez: ${Object.values(PNEU_ETAT).join(", ")}`
      );
    }

    const pneu = await Pneu.findById(req.params.id);

    if (!pneu) {
      return ResponseHandler.notFound(res, "Pneu non trouvé");
    }

    pneu.etat = etat;
    await pneu.save();

    const updatedPneu = await Pneu.findById(pneu._id).populate(
      "vehicule",
      "matricule marque modele"
    );

    return ResponseHandler.success(
      res,
      { pneu: updatedPneu },
      "État du pneu mis à jour avec succès"
    );
  } catch (error) {
    console.error("Update pneu etat error:", error);

    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID de pneu invalide");
    }

    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la mise à jour de l'état du pneu"
    );
  }
};

exports.deletePneu = async (req, res) => {
  try {
    const pneu = await Pneu.findById(req.params.id);

    if (!pneu) {
      return ResponseHandler.notFound(res, "Pneu non trouvé");
    }

    const VehicleModel = pneu.vehiculeType === "Camion" ? Camion : Remorque;
    await VehicleModel.findByIdAndUpdate(pneu.vehicule, {
      $pull: { pneus: pneu._id },
    });

    await Pneu.findByIdAndDelete(req.params.id);

    return ResponseHandler.success(res, { pneu }, "Pneu supprimé avec succès");
  } catch (error) {
    console.error("Delete pneu error:", error);

    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID de pneu invalide");
    }

    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la suppression du pneu"
    );
  }
};
