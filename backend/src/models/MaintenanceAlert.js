const mongoose = require("mongoose");
const { ALERT_TYPES } = require("../utils/constants");

const maintenanceAlertSchema = new mongoose.Schema(
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
      required: true,
    },
    typeAlerte: {
      type: String,
      enum: Object.values(ALERT_TYPES),
      required: true,
    },
    regle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MaintenanceRule",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    kilometrageActuel: {
      type: Number,
      required: true,
    },
    kilometragePrevu: {
      type: Number,
    },
    dateGeneree: {
      type: Date,
      default: Date.now,
    },
    dateLimite: {
      type: Date,
    },
    urgente: {
      type: Boolean,
      default: false,
    },
    lue: {
      type: Boolean,
      default: false,
    },
    traitee: {
      type: Boolean,
      default: false,
    },
    maintenance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Maintenance",
    },
  },
  {
    timestamps: true,
  }
);

maintenanceAlertSchema.index({ vehicule: 1, traitee: 1 });
maintenanceAlertSchema.index({ lue: 1, urgente: 1 });
maintenanceAlertSchema.index({ dateGeneree: -1 });

module.exports = mongoose.model("MaintenanceAlert", maintenanceAlertSchema);
