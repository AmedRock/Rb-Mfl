import '../../styles/fifaCard.css';

function getCardTier(overall) {
  if (overall >= 85) return 'gold';
  if (overall >= 70) return 'silver';
  return 'bronze';
}

function getStatColor(value) {
  if (value >= 80) return 'stat-high';
  if (value >= 60) return 'stat-mid';
  return 'stat-low';
}

export default function FifaCard({ player, onClick }) {
  const tier = getCardTier(player.overall);

  const stats = [
    { label: 'HIZ', value: player.stats?.pace },
    { label: 'ŞUT', value: player.stats?.shooting },
    { label: 'PAS', value: player.stats?.passing },
    { label: 'DRB', value: player.stats?.dribbling },
    { label: 'DEF', value: player.stats?.defending },
    { label: 'FİZ', value: player.stats?.physical }
  ];

  return (
    <div
      className={`fifa-card ${tier}`}
      onClick={() => onClick && onClick(player)}
      role="button"
      tabIndex={0}
    >
      {/* Skandal rozeti */}
      {player.hasScandal && (
        <span className="fifa-card__scandal-badge">📰 SPK</span>
      )}

      {/* Üst bölüm */}
      <div className="fifa-card__header">
        <div>
          <div className="fifa-card__ovr">{player.overall}</div>
          <div className="fifa-card__pos">{player.position}</div>
        </div>
        <div className="fifa-card__market">
          <span className="value">{player.marketValue}M</span>
        </div>
      </div>

      {/* Fotoğraf */}
      <div className="fifa-card__photo-wrapper">
        <img
          className="fifa-card__photo"
          src={`/players/${player.photo || 'default.png'}`}
          alt={player.name}
          onError={(e) => {
            e.target.src = '/players/default.png';
          }}
        />
      </div>

      {/* İsim */}
      <div className="fifa-card__name">{player.name}</div>
      {player.nickname && (
        <div className="fifa-card__nickname">"{player.nickname}"</div>
      )}

      {/* Statlar */}
      <div className="fifa-card__stats">
        {stats.map((stat) => (
          <div key={stat.label} className="fifa-card__stat">
            <span className="fifa-card__stat-label">{stat.label}</span>
            <span className={`fifa-card__stat-value ${getStatColor(stat.value)}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
