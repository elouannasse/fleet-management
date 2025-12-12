const Trajet = require("../models/Trajet");
const { TRAJET_STATUS, VEHICULE_STATUS } = require("../utils/constants");

const buildFilter = (params, userId, userRole) => {
  const { statut, chauffeur, dateDebut, dateFin } = params;
  const filter = {};

  if (userRole === "chauffeur") {
    filter.chauffeur = userId;
  } else if (chauffeur) {
    filter.chauffeur = chauffeur;
  }

  if (statut) {
    filter.statut = statut;
  }

  if (dateDebut || dateFin) {
    filter.dateDepart = {};
    if (dateDebut) filter.dateDepart.$gte = new Date(dateDebut);
    if (dateFin) filter.dateDepart.$lte = new Date(dateFin);
  }

  return filter;
};

const calculateStats = async (baseFilter) => {
  const [total, aFaire, enCours, termines] = await Promise.all([
    Trajet.countDocuments(baseFilter),
    Trajet.countDocuments({ ...baseFilter, statut: TRAJET_STATUS.A_FAIRE }),
    Trajet.countDocuments({ ...baseFilter, statut: TRAJET_STATUS.EN_COURS }),
    Trajet.countDocuments({ ...baseFilter, statut: TRAJET_STATUS.TERMINE }),
  ]);

  return { total, aFaire, enCours, termines };
};

const populateTrajet = (query, includeDetails = false) => {
  let populated = query
    .populate(
      "chauffeur",
      "nom prenom email" + (includeDetails ? " telephone" : "")
    )
    .populate(
      "camion",
      "matricule marque modele" + (includeDetails ? " kilometrage statut" : "")
    )
    .populate("remorque", "matricule type" + (includeDetails ? " statut" : ""));

  return populated;
};

const updateVehiculeStatus = async (camion, remorque, newStatus) => {
  const updates = [];

  if (camion) {
    camion.statut = newStatus;
    updates.push(camion.save());
  }

  if (remorque) {
    remorque.statut = newStatus;
    updates.push(remorque.save());
  }

  await Promise.all(updates);
};

const validateStatusTransition = (currentStatus, newStatus) => {
  if (
    newStatus === TRAJET_STATUS.EN_COURS &&
    currentStatus !== TRAJET_STATUS.A_FAIRE
  ) {
    return {
      valid: false,
      error: 'Un trajet ne peut passer en cours que depuis le statut "à faire"',
    };
  }

  if (
    newStatus === TRAJET_STATUS.TERMINE &&
    currentStatus !== TRAJET_STATUS.EN_COURS
  ) {
    return {
      valid: false,
      error: 'Un trajet ne peut être terminé que depuis le statut "en cours"',
    };
  }

  return { valid: true };
};

const finalizeTrajet = async (trajet, kilometrageArrivee) => {
  trajet.dateArrivee = new Date();

  if (kilometrageArrivee && trajet.camion) {
    trajet.camion.kilometrage = kilometrageArrivee;
    trajet.camion.statut = VEHICULE_STATUS.DISPONIBLE;
    await trajet.camion.save();
  }

  if (trajet.remorque) {
    trajet.remorque.statut = VEHICULE_STATUS.DISPONIBLE;
    await trajet.remorque.save();
  }
};

const buildPagination = (page, limit, total) => {
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit),
  };
};

const getAllTrajets = async (query, userId, userRole, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const filter = buildFilter(query, userId, userRole);

  const trajets = await populateTrajet(
    Trajet.find(filter)
      .sort({ dateDepart: -1 })
      .limit(parseInt(limit))
      .skip(skip)
  );

  const stats = await calculateStats(filter);

  return {
    trajets,
    stats,
    pagination: buildPagination(page, limit, stats.total),
  };
};

const getTrajetById = async (trajetId) => {
  const trajet = await populateTrajet(Trajet.findById(trajetId), true);

  if (!trajet) {
    throw new Error("Trajet non trouvé");
  }

  return trajet;
};

const getMesTrajets = async (userId, statut, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const filter = { chauffeur: userId };
  if (statut) filter.statut = statut;

  const trajets = await populateTrajet(
    Trajet.find(filter)
      .sort({ dateDepart: -1 })
      .limit(parseInt(limit))
      .skip(skip)
  );

  const stats = await calculateStats(filter);

  return {
    trajets,
    stats,
    pagination: buildPagination(page, limit, stats.total),
  };
};

const createTrajet = async (data, validatedEntities) => {
  const { chauffeur, camion, remorque } = validatedEntities;

  // Map 'poids' to 'poidsMarchandise' if provided
  const trajetData = { ...data };
  if (trajetData.poids !== undefined) {
    trajetData.poidsMarchandise = trajetData.poids;
    delete trajetData.poids;
  }

  const trajet = await Trajet.create({
    ...trajetData,
    statut: trajetData.statut || TRAJET_STATUS.A_FAIRE,
  });

  await updateVehiculeStatus(camion, remorque, VEHICULE_STATUS.EN_SERVICE);

  return await populateTrajet(Trajet.findById(trajet._id));
};

const updateTrajet = async (trajetId, data, newChauffeur = null) => {
  const trajet = await Trajet.findById(trajetId);

  if (!trajet) {
    throw new Error("Trajet non trouvé");
  }

  if (trajet.statut === TRAJET_STATUS.TERMINE) {
    throw new Error("Impossible de modifier un trajet terminé");
  }

  Object.assign(trajet, data);

  if (newChauffeur) {
    trajet.chauffeur = newChauffeur._id;
  }

  await trajet.save();

  return await populateTrajet(Trajet.findById(trajetId));
};

const updateTrajetStatus = async (trajetId, data) => {
  const trajet = await Trajet.findById(trajetId)
    .populate("camion")
    .populate("remorque");

  if (!trajet) {
    throw new Error("Trajet non trouvé");
  }

  const { statut, kilometrageArrivee } = data;

  if (statut) {
    const statusValidation = validateStatusTransition(trajet.statut, statut);
    if (!statusValidation.valid) {
      throw new Error(statusValidation.error);
    }

    trajet.statut = statut;

    if (statut === TRAJET_STATUS.TERMINE) {
      await finalizeTrajet(trajet, kilometrageArrivee);
    }
  }

  Object.assign(trajet, data);

  await trajet.save();

  return await populateTrajet(Trajet.findById(trajetId), true);
};

const deleteTrajet = async (trajetId) => {
  const trajet = await Trajet.findById(trajetId)
    .populate("camion")
    .populate("remorque");

  if (!trajet) {
    throw new Error("Trajet non trouvé");
  }

  if (trajet.statut === TRAJET_STATUS.EN_COURS) {
    throw new Error("Impossible de supprimer un trajet en cours");
  }

  if (trajet.statut !== TRAJET_STATUS.TERMINE) {
    await updateVehiculeStatus(
      trajet.camion,
      trajet.remorque,
      VEHICULE_STATUS.DISPONIBLE
    );
  }

  await trajet.deleteOne();

  return trajet;
};

const getTrajetStats = async (query, userId, userRole) => {
  const filter = buildFilter(query, userId, userRole);
  const stats = await calculateStats(filter);

  const [totalDistance, totalGasoil, totalCout] = await Promise.all([
    Trajet.aggregate([
      { $match: { ...filter, statut: TRAJET_STATUS.TERMINE } },
      { $group: { _id: null, total: { $sum: "$distanceParcourue" } } },
    ]),
    Trajet.aggregate([
      { $match: { ...filter, statut: TRAJET_STATUS.TERMINE } },
      { $group: { _id: null, total: { $sum: "$gasoilConsomme" } } },
    ]),
    Trajet.aggregate([
      { $match: { ...filter, statut: TRAJET_STATUS.TERMINE } },
      { $group: { _id: null, total: { $sum: "$coutGasoil" } } },
    ]),
  ]);

  return {
    ...stats,
    totalDistance: totalDistance[0]?.total || 0,
    totalGasoil: totalGasoil[0]?.total || 0,
    totalCout: totalCout[0]?.total || 0,
  };
};

module.exports = {
  buildFilter,
  calculateStats,
  populateTrajet,
  updateVehiculeStatus,
  validateStatusTransition,
  finalizeTrajet,
  buildPagination,
  getAllTrajets,
  getTrajetById,
  getMesTrajets,
  createTrajet,
  updateTrajet,
  updateTrajetStatus,
  deleteTrajet,
  getTrajetStats,
};
