const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  nickname: {
    type: String,
    trim: true,
    default: ''
  },
  number: {
    type: Number,
    required: true
  },
  photo: {
    type: String,
    default: 'default.png' // frontend/public/players/ klasöründeki dosya adı
  },
  position: {
    type: String,
    required: true,
    enum: ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF']
  },
  tags: [{
    type: String // Mevki esnekliği: ["Forvet", "Kanat", "Orta Saha"]
  }],
  motto: {
    type: String,
    maxlength: 250,
    default: ''
  },

  // FIFA İstatistikleri (1-99)
  stats: {
    pace: { type: Number, min: 1, max: 99, default: 50 },
    shooting: { type: Number, min: 1, max: 99, default: 50 },
    passing: { type: Number, min: 1, max: 99, default: 50 },
    dribbling: { type: Number, min: 1, max: 99, default: 50 },
    defending: { type: Number, min: 1, max: 99, default: 50 },
    physical: { type: Number, min: 1, max: 99, default: 50 }
  },

  // Hesaplanan overall (statlardan türetilir)
  overall: {
    type: Number,
    min: 1,
    max: 99,
    default: 50
  },

  // Piyasa Değeri (M cinsinden)
  marketValue: {
    type: Number,
    min: 20,
    max: 200,
    default: 50
  },

  // Borsa Geçmişi
  marketHistory: [{
    value: Number,
    date: { type: Date, default: Date.now },
    reason: { type: String, default: 'Başlangıç' }
  }],

  // Rozetler
  badges: [{
    name: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now }
  }],

  // Kariyer İstatistikleri
  careerStats: {
    matches: { type: Number, default: 0 },
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    mvpCount: { type: Number, default: 0 },
    avgRating: { type: Number, default: 5.0 }
  }
}, {
  timestamps: true
});

// Overall hesaplama (kaydetmeden önce)
playerSchema.pre('save', function(next) {
  const s = this.stats;
  // Pozisyona göre ağırlıklı OVR hesaplama
  const weights = {
    GK:  { pace: 0.05, shooting: 0.05, passing: 0.15, dribbling: 0.10, defending: 0.30, physical: 0.35 },
    CB:  { pace: 0.10, shooting: 0.05, passing: 0.10, dribbling: 0.10, defending: 0.40, physical: 0.25 },
    LB:  { pace: 0.20, shooting: 0.05, passing: 0.15, dribbling: 0.15, defending: 0.25, physical: 0.20 },
    RB:  { pace: 0.20, shooting: 0.05, passing: 0.15, dribbling: 0.15, defending: 0.25, physical: 0.20 },
    CDM: { pace: 0.10, shooting: 0.10, passing: 0.20, dribbling: 0.15, defending: 0.25, physical: 0.20 },
    CM:  { pace: 0.10, shooting: 0.15, passing: 0.25, dribbling: 0.20, defending: 0.15, physical: 0.15 },
    CAM: { pace: 0.10, shooting: 0.20, passing: 0.25, dribbling: 0.25, defending: 0.05, physical: 0.15 },
    LM:  { pace: 0.20, shooting: 0.15, passing: 0.20, dribbling: 0.20, defending: 0.10, physical: 0.15 },
    RM:  { pace: 0.20, shooting: 0.15, passing: 0.20, dribbling: 0.20, defending: 0.10, physical: 0.15 },
    LW:  { pace: 0.25, shooting: 0.20, passing: 0.15, dribbling: 0.25, defending: 0.05, physical: 0.10 },
    RW:  { pace: 0.25, shooting: 0.20, passing: 0.15, dribbling: 0.25, defending: 0.05, physical: 0.10 },
    ST:  { pace: 0.15, shooting: 0.30, passing: 0.10, dribbling: 0.20, defending: 0.05, physical: 0.20 },
    CF:  { pace: 0.15, shooting: 0.25, passing: 0.15, dribbling: 0.25, defending: 0.05, physical: 0.15 }
  };

  const w = weights[this.position] || weights.CM;
  this.overall = Math.round(
    s.pace * w.pace +
    s.shooting * w.shooting +
    s.passing * w.passing +
    s.dribbling * w.dribbling +
    s.defending * w.defending +
    s.physical * w.physical
  );
  next();
});

module.exports = mongoose.model('Player', playerSchema);
