const Remorque = require("../models/Remorque");
const ResponseHandler = require("../utils/responseHandler");
const { VEHICULE_STATUS } = require("../utils/constants");


exports.getAllRemorques = async (req, res) => {
  try {
    const { statut, type, page = 1, limit = 10 } = req.query;

   
    const filter = {};
    if (statut) filter.statut = statut;
    if (type) filter.type = type;

   
    const skip = (page - 1) * limit;

    const remorques = await Remorque.find(filter)
      .populate("pneus", "reference marque position usure")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Remorque.countDocuments(filter);

    return ResponseHandler.success(
      res,
      {
        remorques,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
      },
      "Remorques récupérées avec succès"
    );
  } catch (error) {
    console.error("Get all remorques error:", error);
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la récupération des remorques"
    );
  }
};


exports.getRemorqueById = async (req, res) => {
  try {
    const remorque = await Remorque.findById(req.params.id).populate(
      "pneus",
      "reference marque position usure statut"
    );

    if (!remorque) {
      return ResponseHandler.notFound(res, "Remorque non trouvée");
    }

    return ResponseHandler.success(
      res,
      { remorque },
      "Remorque récupérée avec succès"
    );
  } catch (error) {
    console.error("Get remorque by ID error:", error);
    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID de remorque invalide");
    }
    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la récupération de la remorque"
    );
  }
};


exports.getRemorquesDisponibles = async (req, res) => {
  try {
    const { type } = req.query;

    const filter = { statut: VEHICULE_STATUS.DISPONIBLE };
    if (type) filter.type = type;

    const remorques = await Remorque.find(filter)
      .populate("pneus", "reference marque position usure")
      .sort({ matricule: 1 });

    return ResponseHandler.success(
      res,
      {
        remorques,
        count: remorques.length,
      },
      "Remorques disponibles récupérées avec succès"
    );
  } catch (error) {
    console.error("Get available remorques error:", error);
    return ResponseHandler.error(
      res,
      error.message ||
        "Erreur lors de la récupération des remorques disponibles"
    );
  }
};


exports.createRemorque = async (req, res) => {
  try {
    const {
      matricule,
      type,
      capacite,
      statut,
      pneus,
      derniereMaintenance,
      prochaineMaintenance,
      remarques,
    } = req.body;

   
    if (!matricule || !type || !capacite) {
      return ResponseHandler.badRequest(
        res,
        "Veuillez fournir tous les champs obligatoires"
      );
    }

   
    const existingRemorque = await Remorque.findOne({
      matricule: matricule.toUpperCase(),
    });
    if (existingRemorque) {
      return ResponseHandler.badRequest(
        res,
        "Une remorque avec cette matricule existe déjà"
      );
    }

    
    const remorque = await Remorque.create({
      matricule,
      type,
      capacite,
      statut: statut || VEHICULE_STATUS.DISPONIBLE,
      pneus: pneus || [],
      derniereMaintenance,
      prochaineMaintenance,
      remarques,
    });

    const populatedRemorque = await Remorque.findById(remorque._id).populate(
      "pneus",
      "reference marque position usure"
    );

    return ResponseHandler.created(
      res,
      { remorque: populatedRemorque },
      "Remorque créée avec succès"
    );
  } catch (error) {
    console.error("Create remorque error:", error);

    if (error.code === 11000) {
      return ResponseHandler.badRequest(
        res,
        "Une remorque avec cette matricule existe déjà"
      );
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return ResponseHandler.badRequest(res, "Erreur de validation", errors);
    }

    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la création de la remorque"
    );
  }
};


exports.updateRemorque = async (req, res) => {
  try {
    const {
      matricule,
      type,
      capacite,
      statut,
      pneus,
      derniereMaintenance,
      prochaineMaintenance,
      remarques,
    } = req.body;

    let remorque = await Remorque.findById(req.params.id);

    if (!remorque) {
      return ResponseHandler.notFound(res, "Remorque non trouvée");
    }

   
    if (matricule && matricule !== remorque.matricule) {
      const existingRemorque = await Remorque.findOne({
        matricule: matricule.toUpperCase(),
      });
      if (existingRemorque) {
        return ResponseHandler.badRequest(
          res,
          "Une remorque avec cette matricule existe déjà"
        );
      }
    }

   
    if (matricule) remorque.matricule = matricule;
    if (type) remorque.type = type;
    if (capacite !== undefined) remorque.capacite = capacite;
    if (statut) remorque.statut = statut;
    if (pneus !== undefined) remorque.pneus = pneus;
    if (derniereMaintenance) remorque.derniereMaintenance = derniereMaintenance;
    if (prochaineMaintenance)
      remorque.prochaineMaintenance = prochaineMaintenance;
    if (remarques !== undefined) remorque.remarques = remarques;

    await remorque.save();

    const updatedRemorque = await Remorque.findById(remorque._id).populate(
      "pneus",
      "reference marque position usure"
    );

    return ResponseHandler.success(
      res,
      { remorque: updatedRemorque },
      "Remorque mise à jour avec succès"
    );
  } catch (error) {
    console.error("Update remorque error:", error);

    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID de remorque invalide");
    }

    if (error.code === 11000) {
      return ResponseHandler.badRequest(
        res,
        "Une remorque avec cette matricule existe déjà"
      );
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return ResponseHandler.badRequest(res, "Erreur de validation", errors);
    }

    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la mise à jour de la remorque"
    );
  }
};


exports.deleteRemorque = async (req, res) => {
  try {
    const remorque = await Remorque.findById(req.params.id);

    if (!remorque) {
      return ResponseHandler.notFound(res, "Remorque non trouvée");
    }

    
    if (remorque.statut === VEHICULE_STATUS.EN_SERVICE) {
      return ResponseHandler.badRequest(
        res,
        "Impossible de supprimer une remorque en service. Veuillez changer son statut d'abord."
      );
    }

    await Remorque.findByIdAndDelete(req.params.id);

    return ResponseHandler.success(
      res,
      { remorque },
      "Remorque supprimée avec succès"
    );
  } catch (error) {
    console.error("Delete remorque error:", error);

    if (error.kind === "ObjectId") {
      return ResponseHandler.badRequest(res, "ID de remorque invalide");
    }

    return ResponseHandler.error(
      res,
      error.message || "Erreur lors de la suppression de la remorque"
    );
  }
};
