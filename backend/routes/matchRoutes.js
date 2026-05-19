const express = require('express');
const router = express.Router();
const {
  getMatches,
  getNextMatch,
  createMatch,
  submitMatchResult,
  getMatchById
} = require('../controllers/matchController');

router.get('/', getMatches);
router.get('/next', getNextMatch);
router.get('/:id', getMatchById);
router.post('/', createMatch);
router.put('/:id/result', submitMatchResult);

module.exports = router;
