/**
 * Piyasa Değeri Motoru (Market Engine)
 * 
 * Oyuncuların maç performanslarına göre stat ve piyasa değerlerini günceller.
 * Kurallar:
 *   - Maç notu (1-10) → Stat değişimi
 *   - OVR ve son performanslar → Piyasa değeri
 *   - Tavan: 200M, Taban: 20M
 *   - Skandal: Anında -%15
 */

const MARKET_CAP = 200;   // Tavan: 200M
const MARKET_FLOOR = 20;  // Taban: 20M

/**
 * Maç notuna göre stat değişimlerini hesaplar
 * Not 1-3: statlar düşer
 * Not 4-6: değişim yok veya minimal
 * Not 7-8: statlar biraz artar
 * Not 9-10: statlar belirgin artar
 */
function calculateStatChanges(rating) {
  if (rating <= 2) return -2;
  if (rating <= 4) return -1;
  if (rating <= 6) return 0;
  if (rating <= 8) return 1;
  return 2; // 9-10 arası
}

/**
 * OVR'den piyasa değeri hesaplar
 * Base formula: value = (OVR / 99) ^ 2 * (MARKET_CAP - MARKET_FLOOR) + MARKET_FLOOR
 * Son 5 maç performansına göre momentum eklenir
 */
function calculateMarketValue(overall, recentRatings = []) {
  // Temel değer (OVR bazlı)
  const normalizedOvr = overall / 99;
  let baseValue = Math.pow(normalizedOvr, 2) * (MARKET_CAP - MARKET_FLOOR) + MARKET_FLOOR;
  
  // Momentum: Son 5 maçın ortalaması
  if (recentRatings.length > 0) {
    const avgRating = recentRatings.reduce((a, b) => a + b, 0) / recentRatings.length;
    const momentum = (avgRating - 5) * 3; // -5 = 5 altı düşüş, 5 üstü yükseliş, x3 çarpan
    baseValue += momentum;
  }

  // Sınırlar
  return Math.round(Math.min(MARKET_CAP, Math.max(MARKET_FLOOR, baseValue)));
}

/**
 * Skandal etkisini uygular
 */
function applyScandal(currentValue, impactPercent = -15) {
  const newValue = currentValue * (1 + impactPercent / 100);
  return Math.round(Math.min(MARKET_CAP, Math.max(MARKET_FLOOR, newValue)));
}

/**
 * Statları günceller (her stat için rastgele biraz farklı)
 */
function updateStats(stats, statChange) {
  const updated = { ...stats };
  const statKeys = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];
  
  statKeys.forEach(key => {
    // Her stat biraz farklı değişir (±1 rastgelelik)
    const variance = Math.random() > 0.5 ? 1 : 0;
    const change = statChange + (Math.random() > 0.7 ? variance : 0);
    updated[key] = Math.min(99, Math.max(1, (updated[key] || 50) + change));
  });

  return updated;
}

/**
 * Tek bir oyuncunun maç sonrası güncellemesini yapar
 */
async function processPlayerAfterMatch(player, rating, isGoalScorer = false, isAssistProvider = false, isMvp = false) {
  const statChange = calculateStatChanges(rating);
  
  // Statları güncelle
  const newStats = updateStats(player.stats.toObject ? player.stats.toObject() : player.stats, statChange);
  player.stats = newStats;
  
  // Kariyer istatistiklerini güncelle
  player.careerStats.matches += 1;
  
  // Ortalama puanı güncelle
  const totalRatings = player.careerStats.avgRating * (player.careerStats.matches - 1) + rating;
  player.careerStats.avgRating = Math.round((totalRatings / player.careerStats.matches) * 10) / 10;
  
  if (isMvp) {
    player.careerStats.mvpCount += 1;
  }

  // Kaydet (pre-save hook OVR'yi hesaplayacak)
  await player.save();
  
  // Son 5 maçın ratinglerini al (marketHistory'den)
  const recentRatings = player.marketHistory
    .slice(-5)
    .map(h => h.value)
    .filter(v => v); // varsa

  // Piyasa değerini güncelle
  const newMarketValue = calculateMarketValue(player.overall, [rating]);
  player.marketValue = newMarketValue;
  
  // Borsa geçmişine ekle
  player.marketHistory.push({
    value: newMarketValue,
    date: new Date(),
    reason: `Maç performansı (Not: ${rating})`
  });

  await player.save();
  return player;
}

module.exports = {
  calculateStatChanges,
  calculateMarketValue,
  applyScandal,
  updateStats,
  processPlayerAfterMatch,
  MARKET_CAP,
  MARKET_FLOOR
};
