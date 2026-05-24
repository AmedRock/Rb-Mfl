import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

export default function MarketSummary({ risers = [], fallers = [] }) {
  if (risers.length === 0 && fallers.length === 0) {
    return (
      <div className="market-summary glass-card">
        <h3 className="market-summary__title">
          📈 Borsa Özeti
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '16px 0' }}>
          Henüz borsa verisi yok. İlk maç sonucu girildikten sonra burada görünecek.
        </p>
      </div>
    );
  }

  return (
    <div className="market-summary glass-card">
      <h3 className="market-summary__title">
        📈 Borsa Özeti
      </h3>

      {/* Yükselen */}
      {risers.length > 0 && (
        <>
          <div className="market-summary__section-label">Yükselenler</div>
          <ul className="market-summary__list">
            {risers.map((player) => (
              <li key={player._id} className="market-summary__item">
                <div className="market-summary__player">
                  <img
                    className="market-summary__player-photo"
                    src={`/players/${player.photo || 'default.png'}`}
                    alt={player.name}
                    onError={(e) => { e.target.src = '/players/default.png'; }}
                  />
                  <div>
                    <div className="market-summary__player-name">{player.nickname || player.name}</div>
                    <div className="market-summary__player-pos">{player.position} · {player.marketValue}M</div>
                  </div>
                </div>
                <span className="market-summary__change text-green">
                  <FaArrowUp style={{ marginRight: 4 }} />
                  +{player.changePercent}%
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {risers.length > 0 && fallers.length > 0 && (
        <hr className="market-summary__divider" />
      )}

      {/* Düşen */}
      {fallers.length > 0 && (
        <>
          <div className="market-summary__section-label">Düşenler</div>
          <ul className="market-summary__list">
            {fallers.map((player) => (
              <li key={player._id} className="market-summary__item">
                <div className="market-summary__player">
                  <img
                    className="market-summary__player-photo"
                    src={`/players/${player.photo || 'default.png'}`}
                    alt={player.name}
                    onError={(e) => { e.target.src = '/players/default.png'; }}
                  />
                  <div>
                    <div className="market-summary__player-name">{player.nickname || player.name}</div>
                    <div className="market-summary__player-pos">{player.position} · {player.marketValue}M</div>
                  </div>
                </div>
                <span className="market-summary__change text-red">
                  <FaArrowDown style={{ marginRight: 4 }} />
                  {player.changePercent}%
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
