const Match = require('../models/Match');
const Player = require('../models/Player');
const { processPlayerAfterMatch } = require('../utils/marketEngine');

// GET /api/matches - Tüm maçlar
const getMatches = async (req, res) => {
  try {
    const matches = await Match.find()
      .populate('teamA.players', 'name nickname photo position overall')
      .populate('teamB.players', 'name nickname photo position overall')
      .populate('mvp', 'name nickname photo')
      .sort({ date: -1 })
      .limit(20);
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Maçlar getirilemedi', error: error.message });
  }
};

// GET /api/matches/next - Sıradaki maç (geri sayım için)
const getNextMatch = async (req, res) => {
  try {
    const nextMatch = await Match.findOne({
      status: 'upcoming',
      date: { $gte: new Date() }
    }).sort({ date: 1 });

    if (!nextMatch) {
      return res.json({ nextMatch: null, message: 'Planlanmış maç yok' });
    }
    res.json({ nextMatch });
  } catch (error) {
    res.status(500).json({ message: 'Sonraki maç getirilemedi', error: error.message });
  }
};

// POST /api/matches - Yeni maç oluştur (Admin)
const createMatch = async (req, res) => {
  try {
    const match = new Match(req.body);
    await match.save();
    res.status(201).json(match);
  } catch (error) {
    res.status(400).json({ message: 'Maç oluşturulamadı', error: error.message });
  }
};

// PUT /api/matches/:id/result - Maç sonucu gir ve borsayı güncelle (Admin)
const submitMatchResult = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Maç bulunamadı' });
    }

    if (match.isProcessed) {
      return res.status(400).json({ message: 'Bu maç zaten işlenmiş' });
    }

    // Maç verisini güncelle
    const { teamAScore, teamBScore, mvp, playerRatings, goalScorers, assistProviders } = req.body;
    match.teamA.score = teamAScore;
    match.teamB.score = teamBScore;
    match.mvp = mvp;
    match.playerRatings = playerRatings || [];
    match.goalScorers = goalScorers || [];
    match.assistProviders = assistProviders || [];
    match.status = 'completed';

    // Her oyuncunun borsasını güncelle
    for (const pr of match.playerRatings) {
      const player = await Player.findById(pr.player);
      if (player) {
        const isGoalScorer = match.goalScorers.some(g => g.player.toString() === pr.player.toString());
        const isAssistProvider = match.assistProviders.some(a => a.player.toString() === pr.player.toString());
        const isMvp = mvp && mvp.toString() === pr.player.toString();

        // Gol ve asist istatistiklerini güncelle
        if (isGoalScorer) {
          const goalEntry = match.goalScorers.find(g => g.player.toString() === pr.player.toString());
          player.careerStats.goals += goalEntry ? goalEntry.count : 0;
        }
        if (isAssistProvider) {
          const assistEntry = match.assistProviders.find(a => a.player.toString() === pr.player.toString());
          player.careerStats.assists += assistEntry ? assistEntry.count : 0;
        }

        await processPlayerAfterMatch(player, pr.rating, isGoalScorer, isAssistProvider, isMvp);
      }
    }

    match.isProcessed = true;
    await match.save();

    res.json({ message: 'Maç sonucu kaydedildi ve borsa güncellendi', match });
  } catch (error) {
    res.status(500).json({ message: 'Maç sonucu kaydedilemedi', error: error.message });
  }
};

// PUT /api/matches/:id/squad - Maçın kadrosunu güncelle (Admin)
const updateMatchSquad = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Maç bulunamadı' });
    }

    const { format, formation, teamA, teamB, squadAssignments } = req.body;

    if (format) match.format = format;
    if (formation) match.formation = formation;
    
    if (teamA) {
      match.teamA.players = teamA.players;
      if (teamA.name) match.teamA.name = teamA.name;
    }
    
    if (teamB) {
      match.teamB.players = teamB.players;
      if (teamB.name) match.teamB.name = teamB.name;
    }
    
    if (squadAssignments) {
      match.squadAssignments = squadAssignments;
    }

    await match.save();

    res.json({ message: 'Kadro başarıyla maça bağlandı', match });
  } catch (error) {
    res.status(500).json({ message: 'Kadro kaydedilemedi', error: error.message });
  }
};

// GET /api/matches/:id - Tek maç detayı
const getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('teamA.players', 'name nickname photo position overall')
      .populate('teamB.players', 'name nickname photo position overall')
      .populate('mvp', 'name nickname photo overall')
      .populate('playerRatings.player', 'name nickname photo')
      .populate('goalScorers.player', 'name nickname')
      .populate('assistProviders.player', 'name nickname');
    
    if (!match) {
      return res.status(404).json({ message: 'Maç bulunamadı' });
    }
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: 'Maç getirilemedi', error: error.message });
  }
};

module.exports = {
  getMatches,
  getNextMatch,
  createMatch,
  submitMatchResult,
  updateMatchSquad,
  getMatchById
};
