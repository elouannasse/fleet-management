const mongoose = require("mongoose");
const { PNEU_ETAT } = require("../utils/constants");

const pneuSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: [true, "La référence est obligatoire"],
      trim: true,
    },
    marque: {
      type: String,
      required: [true, "La marque est obligatoire"],
      trim: true,
    },
    dimension: {
      type: String,
      required: [true, "La dimension est obligatoire"],
      trim: true,
    },
    position: {
      type: String,
      required: [true, "La position est obligatoire"],
      enum: [
        "avant-gauche",
        "avant-droit",
        "arrière-gauche",
        "arrière-droit",
        "secours",
      ],
    },
    vehiculeType: {
      type: String,
      enum: ["Camion", "Remorque"],
      required: true,
      set: function (val) {
        // Normalize to capitalized format: 'camion' -> 'Camion', 'remorque' -> 'Remorque'
        if (!val) return val;
        return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
      },
    },
    vehicule: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "vehiculeType",
      required: true,
    },
    dateInstallation: {
      type: Date,
      default: Date.now,
    },
    kilometrageInstallation: {
      type: Number,
      required: [true, "Le kilométrage à l'installation est obligatoire"],
      min: 0,
    },
    etat: {
      type: String,
      enum: Object.values(PNEU_ETAT),
      default: PNEU_ETAT.NEUF,
    },
    pressionRecommandee: {
      type: Number,
      required: [true, "La pression recommandée est obligatoire"],
      min: 0,
    },
    remarques: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toObject: { getters: true },
    toJSON: { getters: true },
  }
);

module.exports = mongoose.model("Pneu", pneuSchema);
