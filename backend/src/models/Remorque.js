const mongoose = require('mongoose');
const { VEHICULE_STATUS } = require('../utils/constants');

const remorqueSchema = new mongoose.Schema(
  {
    matricule: {
      type: String,
      required: [true, 'La matricule est obligatoire'],
      unique: true,
      uppercase: true,
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Le type est obligatoire'],
      enum: ['frigorifique', 'bâchée', 'plateau', 'citerne'],
      trim: true
    },
    capacite: {
      type: Number,
      required: [true, 'La capacité est obligatoire'],
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


remorqueSchema.index({ matricule: 1 });
remorqueSchema.index({ statut: 1 });

module.exports = mongoose.model('Remorque', remorqueSchema);