const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const {
  adminLogin,
  createScandal,
  getScandals,
  deleteScandal,
  addBadge,
  updatePlayerStats,
  deleteMatch,
  getPendingPlayers,
  approvePlayer,
  rejectPlayer,
  linkPlayer,
  deleteNews
} = require('../controllers/adminController');

// Auth (Admin Giriş)
router.post('/login', adminLogin);

// Haberler
router.delete('/news/:id', authMiddleware, deleteNews);

// Korumalı route'lar — JWT gerekli
router.post('/scandal', authMiddleware, createScandal);
router.get('/scandals', authMiddleware, getScandals);
router.delete('/scandal/:id', authMiddleware, deleteScandal);
router.post('/player/:id/badge', authMiddleware, addBadge);
router.put('/player/:id/stats', authMiddleware, updatePlayerStats);
router.delete('/match/:id', authMiddleware, deleteMatch);
router.get('/pending-players', authMiddleware, getPendingPlayers);
router.put('/player/:id/approve', authMiddleware, approvePlayer);
router.put('/player/:id/reject', authMiddleware, rejectPlayer);
router.put('/player/:id/link', authMiddleware, linkPlayer);

// Fotoğraf yükleme endpoint'i (frontend public/players klasörüne kaydeder)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../frontend/public/players'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'player-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.post('/upload', authMiddleware, upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Lütfen bir fotoğraf seçin' });
  }
  res.json({ filename: req.file.filename });
});

module.exports = router;
