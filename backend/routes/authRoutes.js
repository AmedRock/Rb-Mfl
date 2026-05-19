const express = require('express');
const router = express.Router();
const { register, loginPlayer, getMe } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', loginPlayer);
router.get('/me', getMe);

module.exports = router;
