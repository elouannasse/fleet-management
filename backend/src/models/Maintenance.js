const mongoose = require("mongoose");
const {
  MAINTENANCE_TYPES,
  MAINTENANCE_STATUS,
  MAINTENANCE_PRIORITY,
} = require("../utils/constants");

const maintenanceSchema = new mongoose.Schema(
  {
    vehiculeType: {
      type: String,
      enum: ["Camion", "Remorque"],
      required: true,
      set: function (val) {
        if (!val) return val;
        return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
      },
    },
    vehicule: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "vehiculeType",
      required: [true, "Le véhicule est obligatoire"],
    },
    type: {
      type: String,
      enum: Object.values(MAINTENANCE_TYPES),
      required: [true, "Le type de maintenance est obligatoire"],
    },
    description: {
      type: String,
      required: [true, "La description est obligatoire"],
      trim: true,
    },
    statut: {
      type: String,
      enum: Object.values(MAINTENANCE_STATUS),
      default: MAINTENANCE_STATUS.PLANIFIEE,
    },
    priorite: {
      type: String,
      enum: Object.values(MAINTENANCE_PRIORITY),
      default: MAINTENANCE_PRIORITY.NORMALE,
    },
    kilometrageActuel: {
      type: Number,
      required: [true, "Le kilométrage actuel est obligatoire"],
      min: 0,
    },
    datePrevue: {
      type: Date,
      required: [true, "La date prévue est obligatoire"],
    },
    dateDebut: {
      type: Date,
    },
    dateFin: {
      type: Date,
    },
    cout: {
      type: Number,
      min: 0,
      default: 0,
    },
    pieces: [
      {
        nom: {
          type: String,
          required: true,
        },
        quantite: {
          type: Number,
          required: true,
          min: 1,
        },
        prixUnitaire: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    mainDoeuvre: {
      type: Number,
      min: 0,
      default: 0,
    },
    technicien: {
      type: String,
      trim: true,
    },
    garage: {
      type: String,
      trim: true,
    },
    remarques: {
      type: String,
      trim: true,
    },
    creePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

// Virtual pour le coût total
maintenanceSchema.virtual("coutTotal").get(function () {
  const coutPieces = this.pieces.reduce((sum, piece) => {
    return sum + piece.quantite * piece.prixUnitaire;
  }, 0);
  return coutPieces + this.mainDoeuvre + (this.cout || 0);
});

// Index pour les requêtes fréquentes
maintenanceSchema.index({ vehicule: 1, datePrevue: 1 });
maintenanceSchema.index({ statut: 1, priorite: 1 });
maintenanceSchema.index({ type: 1, datePrevue: 1 });

module.exports = mongoose.model("Maintenance", maintenanceSchema);
