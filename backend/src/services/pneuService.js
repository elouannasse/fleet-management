const Pneu = require("../models/Pneu");
const Camion = require("../models/Camion");
const Remorque = require("../models/Remorque");
const { PNEU_ETAT } = require("../utils/constants");


const getAllPneus = async (query, page = 1, limit = 10) => {
  const { etat, vehiculeType, vehicule } = query;

  const filter = {};
  if (etat) filter.etat = etat;
  if (vehiculeType) filter.vehiculeType = vehiculeType;
  if (vehicule) filter.vehicule = vehicule;

  const skip = (page - 1) * limit;

  const [pneus, total] = await Promise.all([
    Pneu.find(filter)
      .populate("vehicule", "matricule marque modele")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }),
    Pneu.countDocuments(filter),
  ]);

  return {
    pneus,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    limit: parseInt(limit),
  };
};


const getPneuById = async (pneuId) => {
  const pneu = await Pneu.findById(pneuId).populate(
    "vehicule",
    "matricule marque modele statut"
  );

  if (!pneu) {
    throw new Error("Pneu non trouvé");
  }

  return pneu;
};


const getPneusByVehicule = async (vehiculeType, vehiculeId) => {
  if (!["Camion", "Remorque"].includes(vehiculeType)) {
    throw new Error(
      'Type de véhicule invalide. Utilisez "Camion" ou "Remorque"'
    );
  }

  const VehicleModel = vehiculeType === "Camion" ? Camion : Remorque;
  const vehicleExists = await VehicleModel.findById(vehiculeId);

  if (!vehicleExists) {
    throw new Error(`${vehiculeType} non trouvé`);
  }

  const pneus = await Pneu.find({ vehiculeType, vehicule: vehiculeId })
    .populate("vehicule", "matricule marque modele")
    .sort({ position: 1 });

  return {
    pneus,
    count: pneus.length,
    vehicule: vehicleExists,
  };
};


const createPneu = async (data) => {
  const { vehiculeType, vehicule, position } = data;

  
  const VehicleModel = vehiculeType === "Camion" ? Camion : Remorque;
  const vehicleExists = await VehicleModel.findById(vehicule);

  if (!vehicleExists) {
    throw new Error(`${vehiculeType} non trouvé`);
  }


  const existingPneu = await Pneu.findOne({
    vehiculeType,
    vehicule,
    position,
  });

  if (existingPneu) {
    throw new Error(
      `Un pneu existe déjà à la position "${position}" sur ce véhicule`
    );
  }

 
  const pneu = await Pneu.create({
    ...data,
    etat: data.etat || PNEU_ETAT.NEUF,
  });


  await VehicleModel.findByIdAndUpdate(vehicule, {
    $push: { pneus: pneu._id },
  });

 
  return await Pneu.findById(pneu._id).populate(
    "vehicule",
    "matricule marque modele"
  );
};


const updatePneu = async (pneuId, data) => {
  const pneu = await Pneu.findById(pneuId);

  if (!pneu) {
    throw new Error("Pneu non trouvé");
  }

  const { vehicule, vehiculeType, position } = data;


  if (vehicule && vehicule !== pneu.vehicule.toString()) {
    const newVehiculeType = vehiculeType || pneu.vehiculeType;
    const VehicleModel = newVehiculeType === "Camion" ? Camion : Remorque;
    const vehicleExists = await VehicleModel.findById(vehicule);

    if (!vehicleExists) {
      throw new Error(`${newVehiculeType} non trouvé`);
    }

    
    const OldVehicleModel = pneu.vehiculeType === "Camion" ? Camion : Remorque;
    await OldVehicleModel.findByIdAndUpdate(pneu.vehicule, {
      $pull: { pneus: pneu._id },
    });

    
    await VehicleModel.findByIdAndUpdate(vehicule, {
      $push: { pneus: pneu._id },
    });
  }

  if (position && position !== pneu.position) {
    const existingPneu = await Pneu.findOne({
      _id: { $ne: pneuId },
      vehiculeType: vehiculeType || pneu.vehiculeType,
      vehicule: vehicule || pneu.vehicule,
      position,
    });

    if (existingPneu) {
      throw new Error(
        `Un pneu existe déjà à la position "${position}" sur ce véhicule`
      );
    }
  }


  Object.assign(pneu, data);
  await pneu.save();

  
  return await Pneu.findById(pneu._id).populate(
    "vehicule",
    "matricule marque modele"
  );
};


const updatePneuEtat = async (pneuId, etat) => {
  const pneu = await Pneu.findById(pneuId);

  if (!pneu) {
    throw new Error("Pneu non trouvé");
  }

  pneu.etat = etat;
  await pneu.save();

  return await Pneu.findById(pneu._id).populate(
    "vehicule",
    "matricule marque modele"
  );
};


const deletePneu = async (pneuId) => {
  const pneu = await Pneu.findById(pneuId);

  if (!pneu) {
    throw new Error("Pneu non trouvé");
  }


  const VehicleModel = pneu.vehiculeType === "Camion" ? Camion : Remorque;
  await VehicleModel.findByIdAndUpdate(pneu.vehicule, {
    $pull: { pneus: pneu._id },
  });

  await Pneu.findByIdAndDelete(pneuId);

  return pneu;
};

module.exports = {
  getAllPneus,
  getPneuById,
  getPneusByVehicule,
  createPneu,
  updatePneu,
  updatePneuEtat,
  deletePneu,
};
