const jwt = require('jsonwebtoken');
const Player = require('../models/Player');

// POST /api/auth/register — Oyuncu hesap başvurusu
const register = async (req, res) => {
  try {
    const { email, password, name, nickname, number, position, photo, tags, motto } = req.body;

    if (!email || !password || !name || !number || !position) {
      return res.status(400).json({ message: 'Email, şifre, ad, forma no ve pozisyon zorunludur' });
    }

    // E-posta benzersizlik kontrolü
    const existing = await Player.findOne({ email });
    if (existing) {
      if (existing.accountStatus === 'rejected') {
        // Reddedilen oyuncu tekrar başvuruyor — bilgileri güncelle
        existing.password = password;
        existing.name = name;
        existing.nickname = nickname || '';
        existing.number = number;
        existing.position = position;
        existing.photo = photo || 'default.png';
        existing.tags = tags || [];
        existing.motto = motto || '';
        existing.accountStatus = 'pending';
        existing.rejectionMessage = '';
        await existing.save();
        return res.status(200).json({ message: 'Başvurunuz tekrar gönderildi. Admin onayı bekleniyor.' });
      }
      return res.status(409).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
    }

    // Yeni oyuncu oluştur (pending durumunda)
    const player = new Player({
      email,
      password, // düz metin
      name,
      nickname: nickname || '',
      number,
      position,
      photo: photo || 'default.png',
      tags: tags || [],
      motto: motto || '',
      accountStatus: 'pending',
      // Statlar ve piyasa değeri admin tarafından doldurulacak
      stats: { pace: 50, shooting: 50, passing: 50, dribbling: 50, defending: 50, physical: 50 },
      marketValue: 50
    });

    player.marketHistory.push({
      value: 50,
      date: new Date(),
      reason: 'Başlangıç'
    });

    await player.save();
    res.status(201).json({ message: 'Başvurunuz alındı! Admin onayından sonra giriş yapabilirsiniz.' });
  } catch (error) {
    res.status(500).json({ message: 'Kayıt hatası', error: error.message });
  }
};

// POST /api/auth/login — Oyuncu giriş
const loginPlayer = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'E-posta ve şifre gerekli' });
    }

    const player = await Player.findOne({ email });
    if (!player) {
      return res.status(401).json({ message: 'E-posta veya şifre hatalı' });
    }

    if (player.accountStatus === 'pending') {
      return res.status(403).json({ message: 'Hesabınız henüz admin tarafından onaylanmadı. Lütfen bekleyin.' });
    }

    if (player.accountStatus === 'rejected') {
      return res.status(403).json({ 
        message: `Başvurunuz reddedildi: ${player.rejectionMessage || 'Sebep belirtilmedi'}. Tekrar başvurabilirsiniz.` 
      });
    }

    if (player.accountStatus === 'none') {
      return res.status(403).json({ message: 'Bu oyuncunun henüz bir hesabı yok.' });
    }

    // Şifre kontrolü (düz metin)
    if (player.password !== password) {
      return res.status(401).json({ message: 'E-posta veya şifre hatalı' });
    }

    const token = jwt.sign(
      { role: 'player', playerId: player._id, name: player.name },
      process.env.JWT_SECRET || 'rbmfl_secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      player: {
        _id: player._id,
        name: player.name,
        nickname: player.nickname,
        photo: player.photo,
        position: player.position,
        overall: player.overall
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Giriş hatası', error: error.message });
  }
};

// GET /api/auth/me — Token ile oyuncu bilgisi
const getMe = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token yok' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rbmfl_secret');
    if (decoded.role !== 'player') {
      return res.status(403).json({ message: 'Oyuncu tokeni gerekli' });
    }

    const player = await Player.findById(decoded.playerId).select('-password');
    if (!player) return res.status(404).json({ message: 'Oyuncu bulunamadı' });

    res.json(player);
  } catch (error) {
    res.status(401).json({ message: 'Geçersiz token' });
  }
};

module.exports = { register, loginPlayer, getMe };
