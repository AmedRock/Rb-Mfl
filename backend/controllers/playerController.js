const Player = require('../models/Player');

// İstatistik alanları
const STAT_FIELDS = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];

// GET /api/players - Tüm oyuncuları getir
const getPlayers = async (req, res) => {
  try {
    const { sort, position, search, ...rest } = req.query;

    let filter = {};
    if (position) filter.position = position;
    if (search) filter.name = { $regex: search, $options: 'i' };

    // OVR aralığı
    if (rest.minOvr || rest.maxOvr) {
      filter.overall = {};
      if (rest.minOvr) filter.overall.$gte = Number(rest.minOvr);
      if (rest.maxOvr) filter.overall.$lte = Number(rest.maxOvr);
    }

    // Stat aralıkları (pace, shooting, passing, dribbling, defending, physical)
    STAT_FIELDS.forEach(stat => {
      const minKey = `min${stat.charAt(0).toUpperCase() + stat.slice(1)}`;
      const maxKey = `max${stat.charAt(0).toUpperCase() + stat.slice(1)}`;
      if (rest[minKey] || rest[maxKey]) {
        filter[`stats.${stat}`] = {};
        if (rest[minKey]) filter[`stats.${stat}`].$gte = Number(rest[minKey]);
        if (rest[maxKey]) filter[`stats.${stat}`].$lte = Number(rest[maxKey]);
      }
    });

    let sortOption = {};
    switch (sort) {
      case 'overall':   sortOption = { overall: -1 }; break;
      case 'pace':      sortOption = { 'stats.pace': -1 }; break;
      case 'shooting':  sortOption = { 'stats.shooting': -1 }; break;
      case 'passing':   sortOption = { 'stats.passing': -1 }; break;
      case 'dribbling': sortOption = { 'stats.dribbling': -1 }; break;
      case 'defending': sortOption = { 'stats.defending': -1 }; break;
      case 'physical':  sortOption = { 'stats.physical': -1 }; break;
      case 'marketValue': sortOption = { marketValue: -1 }; break;
      case 'name':      sortOption = { name: 1 }; break;
      default:          sortOption = { overall: -1 };
    }

    const players = await Player.find(filter).sort(sortOption);
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: 'Oyuncular getirilemedi', error: error.message });
  }
};

// GET /api/players/:id - Tek oyuncu detayı
const getPlayerById = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ message: 'Oyuncu bulunamadı' });
    }
    res.json(player);
  } catch (error) {
    res.status(500).json({ message: 'Oyuncu getirilemedi', error: error.message });
  }
};

// POST /api/players - Yeni oyuncu ekle
const createPlayer = async (req, res) => {
  try {
    const player = new Player(req.body);
    
    // İlk piyasa değerini marketHistory'ye ekle
    player.marketHistory.push({
      value: player.marketValue,
      date: new Date(),
      reason: 'Başlangıç'
    });
    
    await player.save();
    res.status(201).json(player);
  } catch (error) {
    res.status(400).json({ message: 'Oyuncu eklenemedi', error: error.message });
  }
};

// PUT /api/players/:id - Oyuncu güncelle
const updatePlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ message: 'Oyuncu bulunamadı' });
    }

    Object.assign(player, req.body);
    await player.save();
    res.json(player);
  } catch (error) {
    res.status(400).json({ message: 'Oyuncu güncellenemedi', error: error.message });
  }
};

// GET /api/players/market/movers - En çok yükselen ve düşen oyuncular
const getMarketMovers = async (req, res) => {
  try {
    const players = await Player.find();
    
    const movers = players
      .filter(p => p.marketHistory.length >= 2)
      .map(p => {
        const history = p.marketHistory;
        const current = history[history.length - 1].value;
        const previous = history[history.length - 2].value;
        const change = current - previous;
        const changePercent = Math.round((change / previous) * 100);
        return {
          _id: p._id,
          name: p.name,
          nickname: p.nickname,
          photo: p.photo,
          position: p.position,
          overall: p.overall,
          marketValue: p.marketValue,
          change,
          changePercent
        };
      })
      .sort((a, b) => b.changePercent - a.changePercent);

    const risers = movers.filter(m => m.change > 0).slice(0, 3);
    const fallers = movers.filter(m => m.change < 0).slice(-3).reverse();

    res.json({ risers, fallers });
  } catch (error) {
    res.status(500).json({ message: 'Borsa verileri getirilemedi', error: error.message });
  }
};

module.exports = {
  getPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  getMarketMovers
};
