const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['scandal', 'transfer', 'announcement', 'info'],
    required: true
  },
  headline: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    trim: true
  },
  targetPlayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    default: null
  },
  impactPercent: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('News', newsSchema);
