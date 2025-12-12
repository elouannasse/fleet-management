const Remorque = require("../models/Remorque");
const { VEHICULE_STATUS } = require("../utils/constants");

const getAllRemorques = async (filters, page, limit) => {
  const { statut, type } = filters;
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

  return {
    remorques,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit),
    },
  };
};

const getRemorqueById = async (id) => {
  const remorque = await Remorque.findById(id).populate(
    "pneus",
    "reference marque position usure statut"
  );

  if (!remorque) {
    throw new Error("Remorque non trouvée");
  }

  return remorque;
};

const getRemorquesDisponibles = async (type) => {
  const filter = { statut: VEHICULE_STATUS.DISPONIBLE };
  if (type) filter.type = type;

  const remorques = await Remorque.find(filter)
    .populate("pneus", "reference marque position usure")
    .sort({ matricule: 1 });

  return {
    remorques,
    count: remorques.length,
  };
};

const createRemorque = async (data) => {
  const {
    matricule,
    marque,
    modele,
    annee,
    type,
    capacite,
    capaciteCharge,
    typeCarburant,
    dateAcquisition,
    statut,
    pneus,
    derniereMaintenance,
    prochaineMaintenance,
    remarques,
  } = data;

  // Si capaciteCharge est fourni, l'utiliser pour capacite aussi
  const finalCapacite = capaciteCharge || capacite;

  const existingRemorque = await Remorque.findOne({
    matricule: matricule.toUpperCase(),
  });

  if (existingRemorque) {
    throw new Error("Une remorque avec cette matricule existe déjà");
  }

  const remorque = await Remorque.create({
    matricule,
    marque,
    modele,
    annee,
    type,
    capacite: finalCapacite,
    capaciteCharge: finalCapacite,
    typeCarburant,
    dateAcquisition,
    statut: statut || VEHICULE_STATUS.DISPONIBLE,
    pneus: pneus || [],
    derniereMaintenance,
    prochaineMaintenance,
    remarques,
  });

  return await Remorque.findById(remorque._id).populate(
    "pneus",
    "reference marque position usure"
  );
};

const updateRemorque = async (id, data) => {
  const {
    matricule,
    type,
    capacite,
    statut,
    pneus,
    derniereMaintenance,
    prochaineMaintenance,
    remarques,
  } = data;

  let remorque = await Remorque.findById(id);

  if (!remorque) {
    throw new Error("Remorque non trouvée");
  }

  if (matricule && matricule !== remorque.matricule) {
    const existingRemorque = await Remorque.findOne({
      matricule: matricule.toUpperCase(),
    });
    if (existingRemorque) {
      throw new Error("Une remorque avec cette matricule existe déjà");
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

  return await Remorque.findById(remorque._id).populate(
    "pneus",
    "reference marque position usure"
  );
};

const deleteRemorque = async (id) => {
  const remorque = await Remorque.findById(id);

  if (!remorque) {
    throw new Error("Remorque non trouvée");
  }

  if (remorque.statut === VEHICULE_STATUS.EN_SERVICE) {
    throw new Error(
      "Impossible de supprimer une remorque en service. Veuillez changer son statut d'abord."
    );
  }

  await Remorque.findByIdAndDelete(id);

  return remorque;
};

module.exports = {
  getAllRemorques,
  getRemorqueById,
  getRemorquesDisponibles,
  createRemorque,
  updateRemorque,
  deleteRemorque,
};
