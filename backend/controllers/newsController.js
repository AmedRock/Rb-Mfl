const News = require('../models/News');

// GET /api/news - Get latest active news
const getNews = async (req, res) => {
  try {
    const newsList = await News.find({ isActive: true })
      .populate('targetPlayer', 'name nickname photo marketValue position')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(newsList);
  } catch (error) {
    res.status(500).json({ message: 'Haberler getirilemedi', error: error.message });
  }
};

module.exports = {
  getNews
};
