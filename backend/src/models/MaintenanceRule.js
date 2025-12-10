const mongoose = require("mongoose");
const { MAINTENANCE_TYPES, ALERT_TYPES } = require("../utils/constants");

const maintenanceRuleSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, "Le nom de la règle est obligatoire"],
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(MAINTENANCE_TYPES),
      required: [true, "Le type de maintenance est obligatoire"],
    },
    typeAlerte: {
      type: String,
      enum: Object.values(ALERT_TYPES),
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    intervalleKm: {
      type: Number,
      min: 0,
      default: 0,
      validate: {
        validator: function (val) {
          return val > 0 || this.intervalleJours > 0;
        },
        message: "Au moins un intervalle (km ou jours) doit être défini",
      },
    },
    intervalleJours: {
      type: Number,
      min: 0,
      default: 0,
    },
    seuilAlerteKm: {
      type: Number,
      min: 0,
      default: 1000,
      validate: {
        validator: function (val) {
          return !this.intervalleKm || val < this.intervalleKm;
        },
        message: "Le seuil d'alerte doit être inférieur à l'intervalle",
      },
    },
    seuilAlerteJours: {
      type: Number,
      min: 0,
      default: 7,
    },
    vehiculeTypes: [
      {
        type: String,
        enum: ["Camion", "Remorque"],
      },
    ],
    actif: {
      type: Boolean,
      default: true,
    },
    creePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

maintenanceRuleSchema.index({ type: 1, actif: 1 });

module.exports = mongoose.model("MaintenanceRule", maintenanceRuleSchema);
