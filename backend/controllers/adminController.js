const jwt = require('jsonwebtoken');
const Player = require('../models/Player');
const Match = require('../models/Match');
const Scandal = require('../models/Scandal');
const { applyScandal } = require('../utils/marketEngine');

// POST /api/admin/login - Admin giriş → JWT döndür
const adminLogin = async (req, res) => {
  try {
    const { password } = req.body;
    const adminPass = process.env.ADMIN_SECRET_PASS || 'halisaha2026';

    if (password !== adminPass) {
      return res.status(401).json({ success: false, message: 'Yanlış şifre' });
    }

    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET || 'rbmfl_secret',
      { expiresIn: '24h' }
    );

    res.json({ success: true, token, message: 'Sır Odası\'na hoş geldiniz!' });
  } catch (error) {
    res.status(500).json({ message: 'Giriş hatası', error: error.message });
  }
};

// POST /api/admin/scandal - Skandal haberi gir (kalıcı piyasa etkisi)
const createScandal = async (req, res) => {
  try {
    const { targetPlayer, headline, impactPercent } = req.body;

    const player = await Player.findById(targetPlayer);
    if (!player) {
      return res.status(404).json({ message: 'Oyuncu bulunamadı' });
    }

    const impact = impactPercent || -15;

    const scandal = new Scandal({
      targetPlayer,
      headline,
      impactPercent: impact
    });
    await scandal.save();

    const oldValue = player.marketValue;
    const newValue = applyScandal(oldValue, impact);
    player.marketValue = newValue;

    player.marketHistory.push({
      value: newValue,
      date: new Date(),
      reason: `📰 SKANDAL: ${headline}`
    });

    await player.save();

    res.status(201).json({
      message: 'Skandal girildi ve piyasa kalıcı olarak güncellendi',
      scandal,
      oldValue,
      newValue,
      impact: `${impact}%`
    });
  } catch (error) {
    res.status(500).json({ message: 'Skandal oluşturulamadı', error: error.message });
  }
};

// GET /api/admin/scandals - Aktif skandallar
const getScandals = async (req, res) => {
  try {
    const scandals = await Scandal.find({ isActive: true })
      .populate('targetPlayer', 'name nickname photo marketValue')
      .sort({ createdAt: -1 });
    res.json(scandals);
  } catch (error) {
    res.status(500).json({ message: 'Skandallar getirilemedi', error: error.message });
  }
};

// DELETE /api/admin/scandal/:id - Skandal kaldır
const deleteScandal = async (req, res) => {
  try {
    const scandal = await Scandal.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!scandal) {
      return res.status(404).json({ message: 'Skandal bulunamadı' });
    }
    res.json({ message: 'Skandal kaldırıldı', scandal });
  } catch (error) {
    res.status(500).json({ message: 'Skandal kaldırılamadı', error: error.message });
  }
};

// POST /api/admin/player/:id/badge - Oyuncuya rozet ver
const addBadge = async (req, res) => {
  try {
    const { name, icon } = req.body;
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ message: 'Oyuncu bulunamadı' });
    }

    player.badges.push({ name, icon, earnedAt: new Date() });
    await player.save();

    res.json({ message: `"${name}" rozeti eklendi`, player });
  } catch (error) {
    res.status(500).json({ message: 'Rozet eklenemedi', error: error.message });
  }
};

// PUT /api/admin/player/:id/stats - Oyuncu stat editörü
const updatePlayerStats = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ message: 'Oyuncu bulunamadı' });
    }

    const allowedFields = ['name', 'nickname', 'number', 'photo', 'position', 'tags', 'motto', 'stats', 'marketValue'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        player[field] = req.body[field];
      }
    });

    await player.save(); // pre-save hook OVR'yi yeniden hesaplar

    res.json({ message: 'Oyuncu güncellendi', player });
  } catch (error) {
    res.status(500).json({ message: 'Oyuncu güncellenemedi', error: error.message });
  }
};

// DELETE /api/admin/match/:id - Maç sil
const deleteMatch = async (req, res) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Maç bulunamadı' });
    }
    res.json({ message: 'Maç silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Maç silinemedi', error: error.message });
  }
};

// GET /api/admin/pending-players — Bekleyen başvurular
const getPendingPlayers = async (req, res) => {
  try {
    const pending = await Player.find({ accountStatus: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: 'Bekleyen oyuncular getirilemedi', error: error.message });
  }
};

// PUT /api/admin/player/:id/approve — Oyuncu onaylama (admin statları ve piyasa değerini de girebilir)
const approvePlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ message: 'Oyuncu bulunamadı' });
    if (player.accountStatus !== 'pending') {
      return res.status(400).json({ message: 'Bu oyuncu zaten onaylanmış veya beklemede değil' });
    }

    // Admin stat ve piyasa değeri ekleyebilir
    if (req.body.stats) player.stats = req.body.stats;
    if (req.body.marketValue) player.marketValue = req.body.marketValue;
    if (req.body.tags) player.tags = req.body.tags;

    player.accountStatus = 'active';
    player.rejectionMessage = '';
    await player.save();

    res.json({ message: `${player.name} onaylandı!`, player });
  } catch (error) {
    res.status(500).json({ message: 'Onaylama hatası', error: error.message });
  }
};

// PUT /api/admin/player/:id/reject — Oyuncu başvurusu reddet
const rejectPlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ message: 'Oyuncu bulunamadı' });

    player.accountStatus = 'rejected';
    player.rejectionMessage = req.body.message || 'Admin tarafından reddedildi';
    await player.save();

    res.json({ message: `${player.name} reddedildi`, player });
  } catch (error) {
    res.status(500).json({ message: 'Reddetme hatası', error: error.message });
  }
};

// PUT /api/admin/player/:id/link — Mevcut oyuncuyu yeni hesapla eşleştir
const linkPlayer = async (req, res) => {
  try {
    const { pendingPlayerId } = req.body;
    const existingPlayer = await Player.findById(req.params.id);
    const pendingPlayer = await Player.findById(pendingPlayerId);

    if (!existingPlayer || !pendingPlayer) {
      return res.status(404).json({ message: 'Oyuncu bulunamadı' });
    }

    // Pending oyuncunun email/password bilgisini mevcut oyuncuya aktar
    existingPlayer.email = pendingPlayer.email;
    existingPlayer.password = pendingPlayer.password;
    existingPlayer.accountStatus = 'active';
    await existingPlayer.save();

    // Pending kaydı sil
    await Player.findByIdAndDelete(pendingPlayerId);

    res.json({ message: `${pendingPlayer.name} → ${existingPlayer.name} ile eşleştirildi`, player: existingPlayer });
  } catch (error) {
    res.status(500).json({ message: 'Eşleştirme hatası', error: error.message });
  }
};

module.exports = {
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
  linkPlayer
};
