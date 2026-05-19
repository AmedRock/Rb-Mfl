const mongoose = require('mongoose');

const scandalSchema = new mongoose.Schema({
  targetPlayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  headline: {
    type: String,
    required: true,
    trim: true // "Maçtan önce 1.5 porsiyon İskender yedi"
  },
  impactPercent: {
    type: Number,
    default: -15 // Piyasa değerine % etkisi
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    default: 'Admin'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Scandal', scandalSchema);
