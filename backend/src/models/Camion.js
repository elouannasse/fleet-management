const mongoose = require('mongoose');
const { VEHICULE_STATUS } = require('../utils/constants');

const camionSchema = new mongoose.Schema(
  {
    matricule: {
      type: String,
      required: [true, 'La matricule est obligatoire'],
      unique: true,
      uppercase: true,
      trim: true
    },
    marque: {
      type: String,
      required: [true, 'La marque est obligatoire'],
      trim: true
    },
    modele: {
      type: String,
      required: [true, 'Le modèle est obligatoire'],
      trim: true
    },
    annee: {
      type: Number,
      min: [1990, "L'année doit être supérieure à 1990"],
      max: [new Date().getFullYear() + 1, "L'année ne peut pas être dans le futur"]
    },
    kilometrage: {
      type: Number,
      default: 0,
      min: [0, 'Le kilométrage ne peut pas être négatif']
    },
    capaciteCharge: {
      type: Number,
      required: [true, 'La capacité de charge est obligatoire'],
      min: [0, 'La capacité ne peut pas être négative']
    },
    statut: {
      type: String,
      enum: Object.values(VEHICULE_STATUS),
      default: VEHICULE_STATUS.DISPONIBLE
    },
    pneus: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pneu'
    }],
    derniereMaintenance: {
      type: Date
    },
    prochaineMaintenance: {
      type: Date
    },
    remarques: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);


camionSchema.index({ matricule: 1 });
camionSchema.index({ statut: 1 });

module.exports = mongoose.model('Camion', camionSchema);