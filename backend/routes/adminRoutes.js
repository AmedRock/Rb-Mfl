const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  adminLogin,
  createScandal,
  getScandals,
  deleteScandal,
  addBadge,
  updatePlayerStats,
  deleteMatch
} = require('../controllers/adminController');

// Public (giriş için auth gerekmez)
router.post('/login', adminLogin);

// Korumalı route'lar — JWT gerekli
router.post('/scandal', authMiddleware, createScandal);
router.get('/scandals', authMiddleware, getScandals);
router.delete('/scandal/:id', authMiddleware, deleteScandal);
router.post('/player/:id/badge', authMiddleware, addBadge);
router.put('/player/:id/stats', authMiddleware, updatePlayerStats);
router.delete('/match/:id', authMiddleware, deleteMatch);

module.exports = router;
