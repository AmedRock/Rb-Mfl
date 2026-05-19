require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Route importları
const playerRoutes = require('./routes/playerRoutes');
const matchRoutes = require('./routes/matchRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas Bağlantısı
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Atlas bağlantısı başarılı!'))
  .catch(err => console.error('❌ MongoDB bağlantı hatası:', err.message));

// API Route'ları
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/admin', adminRoutes);

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'RB-MFL Backend çalışıyor! 🚀' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint bulunamadı' });
});

// Hata yönetimi
app.use((err, req, res, next) => {
  console.error('Sunucu hatası:', err.stack);
  res.status(500).json({ message: 'Sunucu hatası', error: err.message });
});

app.listen(PORT, () => {
  console.log(`🏟️  RB-MFL Server running on port ${PORT}`);
});
