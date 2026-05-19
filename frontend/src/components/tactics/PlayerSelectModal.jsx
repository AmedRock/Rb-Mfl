import { FaCheck, FaExchangeAlt } from 'react-icons/fa';
import { checkTagMatch } from '../../utils/teamBalancer';
import { ROLE_LABELS } from '../../utils/formations';

export default function PlayerSelectModal({
  isOpen,
  slot,
  allPlayers,
  usedPlayerIds,
  onSelect,
  onClose
}) {
  if (!isOpen || !slot) return null;

  const available = allPlayers.filter(p => !usedPlayerIds.has(p._id));

  // Önerilen (tam uyum) ve joker (diğer) olarak ayır
  const suggested = [];
  const jokers = [];

  available.forEach(player => {
    const match = checkTagMatch(player, slot.role);
    if (match === 'perfect') {
      suggested.push({ ...player, matchType: 'perfect' });
    } else {
      jokers.push({ ...player, matchType: match });
    }
  });

  // Her grubu OVR'ye göre sırala
  suggested.sort((a, b) => (b.overall || 0) - (a.overall || 0));
  jokers.sort((a, b) => {
    // Partial uyumlar üstte
    if (a.matchType !== b.matchType) {
      return a.matchType === 'partial' ? -1 : 1;
    }
    return (b.overall || 0) - (a.overall || 0);
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Başlık */}
        <div className="modal-header">
          <h3>
            <span className="modal-header__role">{ROLE_LABELS[slot.role] || slot.role}</span>
            Oyuncu Seç
          </h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Önerilen Oyuncular */}
        {suggested.length > 0 && (
          <div className="modal-section">
            <div className="modal-section__label">
              <FaCheck style={{ color: 'var(--accent-green)' }} />
              Önerilen Oyuncular — Tam Uyum
            </div>
            <ul className="modal-player-list">
              {suggested.map(player => (
                <li
                  key={player._id}
                  className="modal-player-item modal-player-item--suggested"
                  onClick={() => onSelect(player)}
                >
                  <img
                    className="modal-player-item__photo"
                    src={`/players/${player.photo || 'default.png'}`}
                    alt={player.name}
                    onError={(e) => { e.target.src = '/players/default.png'; }}
                  />
                  <div className="modal-player-item__info">
                    <span className="modal-player-item__name">{player.name}</span>
                    <span className="modal-player-item__meta">
                      {player.position} · OVR {player.overall} · {player.marketValue}M
                    </span>
                  </div>
                  <span className="modal-player-item__badge badge-green">
                    ✓ Tam Uyum
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Ayırıcı */}
        {suggested.length > 0 && jokers.length > 0 && (
          <hr className="modal-divider" />
        )}

        {/* Diğer Seçenekler / Jokerler */}
        {jokers.length > 0 && (
          <div className="modal-section">
            <div className="modal-section__label modal-section__label--secondary">
              <FaExchangeAlt style={{ color: 'var(--text-muted)' }} />
              Diğer Seçenekler / Jokerler
            </div>
            <ul className="modal-player-list">
              {jokers.map(player => (
                <li
                  key={player._id}
                  className="modal-player-item modal-player-item--joker"
                  onClick={() => onSelect(player)}
                >
                  <img
                    className="modal-player-item__photo"
                    src={`/players/${player.photo || 'default.png'}`}
                    alt={player.name}
                    onError={(e) => { e.target.src = '/players/default.png'; }}
                  />
                  <div className="modal-player-item__info">
                    <span className="modal-player-item__name">{player.name}</span>
                    <span className="modal-player-item__meta">
                      {player.position} · OVR {player.overall} · {player.marketValue}M
                    </span>
                  </div>
                  <span className="modal-player-item__tags">
                    {(player.tags || []).join(', ')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {available.length === 0 && (
          <div className="modal-empty">
            Tüm oyuncular sahada! Boş oyuncu kalmadı.
          </div>
        )}
      </div>
    </div>
  );
}
