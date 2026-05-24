const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const { register, loginPlayer, getMe } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', loginPlayer);
router.get('/me', getMe);

// Fotoğraf yükleme — Player token ile (admin gerekmez)
const photoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../frontend/public/players'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'player-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const photoUpload = multer({
  storage: photoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Sadece resim dosyası yüklenebilir'));
  }
});

router.post('/upload-photo', photoUpload.single('photo'), (req, res) => {
  // Player token doğrula
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token gerekli' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rbmfl_secret');
    if (decoded.role !== 'player') {
      return res.status(403).json({ message: 'Oyuncu tokeni gerekli' });
    }
  } catch {
    return res.status(401).json({ message: 'Geçersiz token' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Lütfen bir fotoğraf seçin' });
  }
  res.json({ filename: req.file.filename });
});

module.exports = router;
