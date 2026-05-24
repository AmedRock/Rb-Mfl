const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  format: {
    type: String,
    enum: ['6v6', '7v7', '8v8'],
    default: '7v7'
  },
  formation: {
    type: String, // e.g. "3-2-1"
    default: ''
  },
  squadAssignments: {
    type: mongoose.Schema.Types.Mixed, // Object mapping slotId to Player ID, e.g. { "def_0": "60d...", "b_mid_1": "60d..." }
    default: {}
  },
  status: {
    type: String,
    enum: ['upcoming', 'completed'],
    default: 'upcoming'
  },
  teamA: {
    name: { type: String, default: 'Takım A' },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
    score: { type: Number, default: 0 }
  },
  teamB: {
    name: { type: String, default: 'Takım B' },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
    score: { type: Number, default: 0 }
  },
  mvp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    default: null
  },
  playerRatings: [{
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    rating: { type: Number, min: 1, max: 10 }
  }],
  goalScorers: [{
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    count: { type: Number, default: 1 }
  }],
  assistProviders: [{
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    count: { type: Number, default: 1 }
  }],
  isProcessed: {
    type: Boolean,
    default: false // Borsa güncellemesi yapıldı mı?
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Match', matchSchema);
