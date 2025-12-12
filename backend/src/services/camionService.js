const Camion = require("../models/Camion");
const { VEHICULE_STATUS } = require("../utils/constants");


const getAllCamions = async (query, page = 1, limit = 10) => {
  const { statut, marque, annee } = query;

  const filter = {};
  if (statut) filter.statut = statut;
  if (marque) filter.marque = new RegExp(marque, "i");
  if (annee) filter.annee = parseInt(annee);

  const skip = (page - 1) * limit;

  const [camions, total] = await Promise.all([
    Camion.find(filter)
      .populate("pneus", "reference marque position usure")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }),
    Camion.countDocuments(filter),
  ]);

  return {
    camions,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    limit: parseInt(limit),
  };
};


const getCamionById = async (camionId) => {
  const camion = await Camion.findById(camionId).populate(
    "pneus",
    "reference marque position usure statut"
  );

  if (!camion) {
    throw new Error("Camion non trouvé");
  }

  return camion;
};


const getCamionsDisponibles = async () => {
  const camions = await Camion.find({ statut: VEHICULE_STATUS.DISPONIBLE })
    .populate("pneus", "reference marque position usure")
    .sort({ matricule: 1 });

  return {
    camions,
    count: camions.length,
  };
};


const createCamion = async (data) => {
  
  const existingCamion = await Camion.findOne({
    matricule: data.matricule.toUpperCase(),
  });

  if (existingCamion) {
    throw new Error("Un camion avec cette matricule existe déjà");
  }

  
  const camion = await Camion.create({
    ...data,
    statut: data.statut || VEHICULE_STATUS.DISPONIBLE,
    pneus: data.pneus || [],
  });

  
  return await Camion.findById(camion._id).populate(
    "pneus",
    "reference marque position usure"
  );
};


const updateCamion = async (camionId, data) => {
  const camion = await Camion.findById(camionId);

  if (!camion) {
    throw new Error("Camion non trouvé");
  }

 
  if (data.matricule && data.matricule !== camion.matricule) {
    const existingCamion = await Camion.findOne({
      matricule: data.matricule.toUpperCase(),
      _id: { $ne: camionId },
    });

    if (existingCamion) {
      throw new Error("Un camion avec cette matricule existe déjà");
    }
  }

  
  Object.assign(camion, data);
  await camion.save();

 
  return await Camion.findById(camion._id).populate(
    "pneus",
    "reference marque position usure"
  );
};


const deleteCamion = async (camionId) => {
  const camion = await Camion.findById(camionId);

  if (!camion) {
    throw new Error("Camion non trouvé");
  }

 
  if (camion.statut === VEHICULE_STATUS.EN_SERVICE) {
    throw new Error(
      "Impossible de supprimer un camion en service. Veuillez changer son statut d'abord."
    );
  }

  await Camion.findByIdAndDelete(camionId);

  return camion;
};

module.exports = {
  getAllCamions,
  getCamionById,
  getCamionsDisponibles,
  createCamion,
  updateCamion,
  deleteCamion,
};
