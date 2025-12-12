const mongoose = require("mongoose");
const { VEHICULE_STATUS } = require("../utils/constants");

const remorqueSchema = new mongoose.Schema(
  {
    matricule: {
      type: String,
      required: [true, "La matricule est obligatoire"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    marque: {
      type: String,
      trim: true,
    },
    modele: {
      type: String,
      trim: true,
    },
    annee: {
      type: Number,
      min: [1990, "L'année doit être supérieure à 1990"],
      max: [
        new Date().getFullYear() + 1,
        "L'année ne peut pas être dans le futur",
      ],
    },
    type: {
      type: String,
      required: [true, "Le type est obligatoire"],
      enum: ["frigorifique", "bâchée", "plateau", "citerne"],
      trim: true,
    },
    capacite: {
      type: Number,
      required: [true, "La capacité est obligatoire"],
      min: [0, "La capacité ne peut pas être négative"],
    },
    capaciteCharge: {
      type: Number,
      min: [0, "La capacité ne peut pas être négative"],
    },
    typeCarburant: {
      type: String,
      enum: ["diesel", "essence", "electrique", "hybride"],
    },
    dateAcquisition: {
      type: Date,
    },
    statut: {
      type: String,
      enum: Object.values(VEHICULE_STATUS),
      default: VEHICULE_STATUS.DISPONIBLE,
    },
    pneus: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pneu",
      },
    ],
    derniereMaintenance: {
      type: Date,
    },
    prochaineMaintenance: {
      type: Date,
    },
    remarques: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Remorque", remorqueSchema);
