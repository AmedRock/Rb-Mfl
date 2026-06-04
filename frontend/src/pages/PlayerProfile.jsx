import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { FaArrowLeft } from 'react-icons/fa';
import RadarChart from '../components/profile/RadarChart';
import MarketChart from '../components/profile/MarketChart';
import BadgeList from '../components/profile/BadgeList';
import CareerTimeline from '../components/profile/CareerTimeline';
import '../styles/playerProfile.css';

function getCardTier(overall) {
  if (overall >= 85) return 'gold';
  if (overall >= 70) return 'silver';
  return 'bronze';
}

function getStatFill(value) {
  if (value >= 80) return 'high';
  if (value >= 60) return 'mid';
  return 'low';
}

export default function PlayerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: player, loading, error } = useFetch(`/players/${id}`);

  if (loading) {
    return (
      <div className="player-profile__loading">
        <span>⚽</span>
        Oyuncu bilgileri yükleniyor...
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="player-profile__loading">
        <span>❌</span>
        Oyuncu bulunamadı.
        <button className="player-profile__back" onClick={() => navigate('/scout')}>
          <FaArrowLeft /> Scout'a Dön
        </button>
      </div>
    );
  }

  const tier = getCardTier(player.overall);
  const stats = [
    { key: 'pace', label: 'HIZ', value: player.stats?.pace },
    { key: 'shooting', label: 'ŞUT', value: player.stats?.shooting },
    { key: 'passing', label: 'PAS', value: player.stats?.passing },
    { key: 'dribbling', label: 'DRB', value: player.stats?.dribbling },
    { key: 'defending', label: 'DEF', value: player.stats?.defending },
    { key: 'physical', label: 'FİZ', value: player.stats?.physical }
  ];

  const career = player.careerStats || {};

  return (
    <div className="player-profile">
      {/* Geri butonu */}
      <button className="player-profile__back" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Geri Dön
      </button>

      {/* Skandal Bildirimi */}
      {player.hasScandal && player.activeScandal && (
        <div className="player-profile__scandal animate-fade-in">
          <span className="player-profile__scandal-icon">🚨</span>
          <div className="player-profile__scandal-text">
            <div className="player-profile__scandal-headline">
              SPK BİLDİRİMİ: {player.activeScandal.headline}
            </div>
            <div className="player-profile__scandal-impact">
              Piyasa etkisi: {player.activeScandal.impactPercent}%
            </div>
          </div>
        </div>
      )}

      {/* Üst: Büyük Kart + Biyografi */}
      <div className="player-profile__hero animate-fade-in">
        {/* Büyük FIFA Kartı */}
        <div className={`player-profile__big-card ${tier}`}>
          <span className="player-profile__big-number">#{player.number}</span>
          <div className="player-profile__big-ovr">{player.overall}</div>
          <div className="player-profile__big-pos">{player.position}</div>
          <img
            className="player-profile__big-photo"
            src={`/players/${player.photo || 'default.png'}`}
            alt={player.name}
            onError={(e) => { e.target.src = '/players/default.png'; }}
          />
          <div className="player-profile__big-name">{player.name}</div>
          {player.nickname && (
            <div className="player-profile__big-nickname">"{player.nickname}"</div>
          )}

          {/* Stat çubukları */}
          <div className="big-card-stats">
            {stats.map((stat) => (
              <div key={stat.key} className="big-card-stat">
                <span className="big-card-stat__label">{stat.label}</span>
                <div className="big-card-stat__bar">
                  <div
                    className={`big-card-stat__fill ${getStatFill(stat.value)}`}
                    style={{ width: `${(stat.value / 99) * 100}%` }}
                  />
                </div>
                <span className={`big-card-stat__value stat-${getStatFill(stat.value)}`}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          <div className="player-profile__big-market">
            <span className="value">{player.marketValue}M</span> €
          </div>
        </div>

        {/* Biyografi */}
        <div className="player-profile__bio">
          {/* Soyunma Odası Sözü */}
          {player.motto && (
            <div className="player-profile__motto glass-card">
              <p className="player-profile__motto-text">{player.motto}</p>
            </div>
          )}

          {/* Taglar */}
          {player.tags?.length > 0 && (
            <div className="player-profile__tags">
              {player.tags.map((tag, i) => (
                <span key={i} className="player-profile__tag">{tag}</span>
              ))}
            </div>
          )}

          {/* Kariyer İstatistikleri */}
          <div className="player-profile__career glass-card">
            <h3>📊 Kariyer İstatistikleri</h3>
            <div className="career-grid">
              <div className="career-stat">
                <div className="career-stat__value">{career.matches || 0}</div>
                <div className="career-stat__label">Maç</div>
              </div>
              <div className="career-stat">
                <div className="career-stat__value">{career.goals || 0}</div>
                <div className="career-stat__label">Gol</div>
              </div>
              <div className="career-stat">
                <div className="career-stat__value">{career.assists || 0}</div>
                <div className="career-stat__label">Asist</div>
              </div>
              <div className="career-stat">
                <div className="career-stat__value">{career.mvpCount || 0}</div>
                <div className="career-stat__label">MVP</div>
              </div>
              <div className="career-stat">
                <div className="career-stat__value">{career.avgRating?.toFixed(1) || '0.0'}</div>
                <div className="career-stat__label">Ort. Puan</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grafikler: Radar + Borsa Trendi */}
      <div className="player-profile__charts">
        <div className="player-profile__chart-card glass-card animate-fade-in animate-fade-in-delay-1">
          <h3>🎯 Yetenek Radarı</h3>
          <RadarChart stats={player.stats} />
        </div>

        <div className="player-profile__chart-card glass-card animate-fade-in animate-fade-in-delay-2">
          <h3>📈 Borsa Trendi</h3>
          <MarketChart marketHistory={player.marketHistory || []} />
        </div>
      </div>

      {/* Kariyer & Olaylar Çizelgesi */}
      <div className="player-profile__timeline animate-fade-in animate-fade-in-delay-3" style={{ marginTop: '30px' }}>
        <h3>🗞️ Kariyer ve Medya Geçmişi</h3>
        <div className="glass-card" style={{ padding: '20px' }}>
          <CareerTimeline history={player.marketHistory || []} />
        </div>
      </div>

      {/* Rozetler */}
      <div className="player-profile__badges animate-fade-in animate-fade-in-delay-4" style={{ marginTop: '30px' }}>
        <h3>🏅 Müze - Rozetler</h3>
        <BadgeList badges={player.badges || []} />
      </div>
    </div>
  );
}
