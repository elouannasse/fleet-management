const Camion = require("../models/Camion");
const ResponseHandler = require("../utils/responseHandler");
const { VEHICULE_STATUS } = require("../utils/constants");


exports.getAllCamions = async (req, res) => {
  try {
    const { statut, marque, annee, page = 1, limit = 10 } = req.query;

    
    const filter = {};
    if (statut) filter.statut = statut;
    if (marque) filter.marque = new RegExp(marque, "i");
    if (annee) filter.annee = parseInt(annee);

    // Pagination
    const skip = (page - 1) * limit;

    const camions = await Camion.find(filter)
      .populate("pneus", "reference marque position usure")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Camion.countDocuments(filter);

    return ResponseHandler.success(
      res,
      {
        camions,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
      },
      "Camions récupérés avec succès"
    );
  } catch (error) {
    console.error("Get all camions error:", error);
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la récupération des camions"
    );
  }
};


exports.getCamionById = async (req, res) => {
  try {
    const camion = await Camion.findById(req.params.id).populate(
      "pneus",
      "reference marque position usure statut"
    );

    if (!camion) {
      return ResponseHandler.notFound(res, "Camion non trouvé");
    }

    return ResponseHandler.success(
      res,
      { camion },
      "Camion récupéré avec succès"
    );
  } catch (error) {
    console.error("Get camion by ID error:", error);
    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID de camion invalide");
    }
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la récupération du camion"
    );
  }
};


exports.getCamionsDisponibles = async (req, res) => {
  try {
    const camions = await Camion.find({ statut: VEHICULE_STATUS.DISPONIBLE })
      .populate("pneus", "reference marque position usure")
      .sort({ matricule: 1 });

    return ResponseHandler.success(
      res,
      {
        camions,
        count: camions.length,
      },
      "Camions disponibles récupérés avec succès"
    );
  } catch (error) {
    console.error("Get available camions error:", error);
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la récupération des camions disponibles"
    );
  }
};


exports.createCamion = async (req, res) => {
  try {
    const {
      matricule,
      marque,
      modele,
      annee,
      kilometrage,
      capaciteCharge,
      statut,
      pneus,
      derniereMaintenance,
      prochaineMaintenance,
      remarques,
    } = req.body;

  
    if (!matricule || !marque || !modele || !capaciteCharge) {
      return ResponseHandler.badRequest(
        res,
        "Veuillez fournir tous les champs obligatoires"
      );
    }

    
    const existingCamion = await Camion.findOne({
      matricule: matricule.toUpperCase(),
    });
    if (existingCamion) {
      return ResponseHandler.badRequest(
        res,
        "Un camion avec cette matricule existe déjà"
      );
    }

    
    const camion = await Camion.create({
      matricule,
      marque,
      modele,
      annee,
      kilometrage,
      capaciteCharge,
      statut: statut || VEHICULE_STATUS.DISPONIBLE,
      pneus: pneus || [],
      derniereMaintenance,
      prochaineMaintenance,
      remarques,
    });

    const populatedCamion = await Camion.findById(camion._id).populate(
      "pneus",
      "reference marque position usure"
    );

    return ResponseHandler.created(
      res,
      { camion: populatedCamion },
      "Camion créé avec succès"
    );
  } catch (error) {
    console.error("Create camion error:", error);

    if (error.code === 11000) {
      return ResponseHandler.badRequest(
        res,
        "Un camion avec cette matricule existe déjà"
      );
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return ResponseHandler.badRequest(res, "Erreur de validation", errors);
    }

    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la création du camion"
    );
  }
};


exports.updateCamion = async (req, res) => {
  try {
    const {
      matricule,
      marque,
      modele,
      annee,
      kilometrage,
      capaciteCharge,
      statut,
      pneus,
      derniereMaintenance,
      prochaineMaintenance,
      remarques,
    } = req.body;

    let camion = await Camion.findById(req.params.id);

    if (!camion) {
      return ResponseHandler.notFound(res, "Camion non trouvé");
    }

    
    if (matricule && matricule !== camion.matricule) {
      const existingCamion = await Camion.findOne({
        matricule: matricule.toUpperCase(),
      });
      if (existingCamion) {
        return ResponseHandler.badRequest(
          res,
          "Un camion avec cette matricule existe déjà"
        );
      }
    }

   
    if (matricule) camion.matricule = matricule;
    if (marque) camion.marque = marque;
    if (modele) camion.modele = modele;
    if (annee) camion.annee = annee;
    if (kilometrage !== undefined) camion.kilometrage = kilometrage;
    if (capaciteCharge !== undefined) camion.capaciteCharge = capaciteCharge;
    if (statut) camion.statut = statut;
    if (pneus !== undefined) camion.pneus = pneus;
    if (derniereMaintenance) camion.derniereMaintenance = derniereMaintenance;
    if (prochaineMaintenance)
      camion.prochaineMaintenance = prochaineMaintenance;
    if (remarques !== undefined) camion.remarques = remarques;

    await camion.save();

    const updatedCamion = await Camion.findById(camion._id).populate(
      "pneus",
      "reference marque position usure"
    );

    return ResponseHandler.success(
      res,
      { camion: updatedCamion },
      "Camion mis à jour avec succès"
    );
  } catch (error) {
    console.error("Update camion error:", error);

    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID de camion invalide");
    }

    if (error.code === 11000) {
      return ResponseHandler.badRequest(
        res,
        "Un camion avec cette matricule existe déjà"
      );
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return ResponseHandler.badRequest(res, "Erreur de validation", errors);
    }

    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la mise à jour du camion"
    );
  }
};


exports.deleteCamion = async (req, res) => {
  try {
    const camion = await Camion.findById(req.params.id);

    if (!camion) {
      return ResponseHandler.notFound(res, "Camion non trouvé");
    }

   
    if (camion.statut === VEHICULE_STATUS.EN_SERVICE) {
      return ResponseHandler.badRequest(
        res,
        "Impossible de supprimer un camion en service. Veuillez changer son statut d'abord."
      );
    }

    await Camion.findByIdAndDelete(req.params.id);

    return ResponseHandler.success(
      res,
      { camion },
      "Camion supprimé avec succès"
    );
  } catch (error) {
    console.error("Delete camion error:", error);

    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID de camion invalide");
    }

    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la suppression du camion"
    );
  }
};
