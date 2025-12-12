const mongoose = require("mongoose");
const { TRAJET_STATUS } = require("../utils/constants");

const trajetSchema = new mongoose.Schema(
  {
    chauffeur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Le chauffeur est requis"],
    },
    camion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Camion",
      required: [true, "Le camion est requis"],
    },
    remorque: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Remorque",
      default: null,
    },
    lieuDepart: {
      type: String,
      required: [true, "Le lieu de départ est requis"],
      trim: true,
    },
    lieuArrivee: {
      type: String,
      required: [true, "Le lieu d'arrivée est requis"],
      trim: true,
    },
    dateDepart: {
      type: Date,
      required: [true, "La date de départ est requise"],
    },
    dateArrivee: {
      type: Date,
      default: null,
    },
    distancePrevue: {
      type: Number,
      default: null,
      min: [0, "La distance prévue ne peut pas être négative"],
    },
    kilometrageDepart: {
      type: Number,
      default: null,
      min: [0, "Le kilométrage de départ ne peut pas être négatif"],
    },
    kilometrageArrivee: {
      type: Number,
      default: null,
      min: [0, "Le kilométrage d'arrivée ne peut pas être négatif"],
    },
    gasoilConsomme: {
      type: Number,
      default: null,
      min: [0, "Le gasoil consommé ne peut pas être négatif"],
    },
    coutGasoil: {
      type: Number,
      default: null,
      min: [0, "Le coût du gasoil ne peut pas être négatif"],
    },
    statut: {
      type: String,
      enum: Object.values(TRAJET_STATUS),
      default: TRAJET_STATUS.A_FAIRE,
    },
    marchandise: {
      type: String,
      trim: true,
      default: null,
    },
    poidsMarchandise: {
      type: Number,
      default: null,
      min: [0, "Le poids de la marchandise ne peut pas être négatif"],
    },
    remarques: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field: distanceParcourue
trajetSchema.virtual("distanceParcourue").get(function () {
  if (this.kilometrageArrivee && this.kilometrageDepart) {
    return this.kilometrageArrivee - this.kilometrageDepart;
  }
  return null;
});

// Compound indexes
trajetSchema.index({ chauffeur: 1, statut: 1 });
trajetSchema.index({ dateDepart: -1 });

// Validation: kilometrageArrivee must be >= kilometrageDepart
trajetSchema.pre("save", async function () {
  if (this.kilometrageArrivee && this.kilometrageDepart) {
    if (this.kilometrageArrivee < this.kilometrageDepart) {
      throw new Error(
        "Le kilométrage d'arrivée doit être supérieur ou égal au kilométrage de départ"
      );
    }
  }
});

const Trajet = mongoose.model("Trajet", trajetSchema);

module.exports = Trajet;
