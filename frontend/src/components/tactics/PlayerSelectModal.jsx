import { FaCheck, FaExchangeAlt, FaStar } from 'react-icons/fa';
import { checkTagMatch } from '../../utils/teamBalancer';
import { ROLE_LABELS, POSITION_LABELS } from '../../utils/formations';

export default function PlayerSelectModal({
  isOpen,
  slot,
  allPlayers,
  usedPlayerIds,
  onSelect,
  onClose,
}) {
  if (!isOpen || !slot) return null;

  const available = allPlayers.filter(p => !usedPlayerIds.has(p._id));

  // ── Oyuncuları grupla ──────────────────────────────────────────────────────
  const suggested = [];  // perfect uyum
  const jokers    = [];  // partial/none uyum

  available.forEach(player => {
    const match = checkTagMatch(player, slot.role);
    if (match === 'perfect') {
      // subRole ile tam eşleşen oyuncuya "ideal" bayrağı koy
      const isIdeal = slot.subRole && player.position === slot.subRole;
      suggested.push({ ...player, matchType: 'perfect', isIdeal });
    } else {
      jokers.push({ ...player, matchType: match });
    }
  });

  // Suggested: önce ideal (subRole eşleşen), sonra OVR'ye göre
  suggested.sort((a, b) => {
    if (a.isIdeal !== b.isIdeal) return a.isIdeal ? -1 : 1;
    return (b.overall || 0) - (a.overall || 0);
  });

  // Jokers: partial üste, sonra OVR'ye göre
  jokers.sort((a, b) => {
    if (a.matchType !== b.matchType) return a.matchType === 'partial' ? -1 : 1;
    return (b.overall || 0) - (a.overall || 0);
  });

  const subRoleLabel = slot.subRole ? POSITION_LABELS[slot.subRole] : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>

        {/* ── Başlık ── */}
        <div className="modal-header">
          <h3>
            <span className="modal-header__role">{ROLE_LABELS[slot.role] || slot.role}</span>
            Oyuncu Seç
          </h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* ── SubRole ipucu ── */}
        {subRoleLabel && (
          <div className="modal-subrole-hint">
            <span className="modal-subrole-hint__icon">🎯</span>
            <span>
              Bu slot için ideal mevki:&nbsp;
              <strong>{subRoleLabel} ({slot.subRole})</strong>
            </span>
          </div>
        )}

        {/* ── Önerilen Oyuncular (perfect uyum) ── */}
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
                  className={`modal-player-item modal-player-item--suggested ${
                    player.isIdeal ? 'modal-player-item--ideal' : ''
                  }`}
                  onClick={() => onSelect(player)}
                >
                  <img
                    className="modal-player-item__photo"
                    src={`/players/${player.photo || 'default.png'}`}
                    alt={player.name}
                    onError={e => { e.target.src = '/players/default.png'; }}
                  />
                  <div className="modal-player-item__info">
                    <span className="modal-player-item__name">
                      {player.name}
                      {player.isIdeal && (
                        <span className="modal-player-item__ideal-tag">İdeal</span>
                      )}
                    </span>
                    <span className="modal-player-item__meta">
                      {POSITION_LABELS[player.position] || player.position}
                      &nbsp;·&nbsp;OVR {player.overall}
                      &nbsp;·&nbsp;{player.marketValue}M
                    </span>
                  </div>
                  <span className="modal-player-item__badge badge-green">
                    {player.isIdeal ? <><FaStar style={{ marginRight: 3 }} />İdeal</> : '✓ Uyumlu'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Ayırıcı ── */}
        {suggested.length > 0 && jokers.length > 0 && <hr className="modal-divider" />}

        {/* ── Joker / Diğer Seçenekler ── */}
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
                    onError={e => { e.target.src = '/players/default.png'; }}
                  />
                  <div className="modal-player-item__info">
                    <span className="modal-player-item__name">{player.name}</span>
                    <span className="modal-player-item__meta">
                      {POSITION_LABELS[player.position] || player.position}
                      &nbsp;·&nbsp;OVR {player.overall}
                      &nbsp;·&nbsp;{player.marketValue}M
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
