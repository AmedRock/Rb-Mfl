const express = require('express');
const router = express.Router();
const {
  getPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  getMarketMovers
} = require('../controllers/playerController');

// Borsa verileri (market/movers) daha spesifik olduğu için :id'den önce gelmeli
router.get('/market/movers', getMarketMovers);
router.get('/', getPlayers);
router.get('/:id', getPlayerById);
router.post('/', createPlayer);
router.put('/:id', updatePlayer);

module.exports = router;
