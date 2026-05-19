import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { apiAuthPost, apiAuthDelete } from '../../hooks/useAuth';

const PRESET_BADGES = [
  { name: 'Duvar', icon: '🧱' },
  { name: 'Motor', icon: '🏃' },
  { name: 'Hat-trick Kralı', icon: '👑' },
  { name: 'Asist Kralı', icon: '🎯' },
  { name: 'Demir Adam', icon: '🦾' },
  { name: 'Altın Eldiven', icon: '🧤' },
  { name: 'Sniper', icon: '🎯' },
  { name: 'Kaptan', icon: '🅰️' },
  { name: 'Yeni Yıldız', icon: '⭐' },
  { name: 'Kurtarıcı', icon: '🛡️' },
  { name: 'Maçın Adamı', icon: '🏆' },
  { name: 'Seri Golcü', icon: '🔥' }
];

export default function BadgesTab({ authHeader }) {
  const { data: players } = useFetch('/players');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [badgeMode, setBadgeMode] = useState('preset'); // 'preset' | 'custom'
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [customName, setCustomName] = useState('');
  const [customIcon, setCustomIcon] = useState('🏅');
  const [status, setStatus] = useState('');

  const handleGive = async () => {
    if (!selectedPlayer) return;
    const badge = badgeMode === 'preset' ? selectedBadge : { name: customName, icon: customIcon };
    if (!badge?.name) return;
    setStatus('');
    try {
      await apiAuthPost(`/admin/player/${selectedPlayer}/badge`, badge, authHeader);
      setStatus('success');
      setSelectedBadge(null);
      setCustomName(''); setCustomIcon('🏅');
    } catch (err) {
      setStatus('error:' + err.message);
    }
  };

  return (
    <div className="admin-tab">
      <h2 className="admin-tab__title">🏅 Rozet Ver</h2>
      <p className="admin-tab__desc">Oyunculara başarı rozetleri atayın.</p>

      <div className="admin-form">
        <div className="admin-form__group">
          <label>Oyuncu</label>
          <select value={selectedPlayer} onChange={e => setSelectedPlayer(e.target.value)}>
            <option value="">-- Oyuncu seçin --</option>
            {(players || []).map(p => (
              <option key={p._id} value={p._id}>{p.name} ({p.position})</option>
            ))}
          </select>
        </div>

        <div className="admin-form__group">
          <label>Rozet Türü</label>
          <div className="admin-btn-group">
            <button type="button"
              className={`admin-btn-option ${badgeMode === 'preset' ? 'admin-btn-option--active' : ''}`}
              onClick={() => setBadgeMode('preset')}>📋 Listeden Seç</button>
            <button type="button"
              className={`admin-btn-option ${badgeMode === 'custom' ? 'admin-btn-option--active' : ''}`}
              onClick={() => setBadgeMode('custom')}>✏️ Özel</button>
          </div>
        </div>

        {badgeMode === 'preset' ? (
          <div className="admin-form__group">
            <label>Rozet Seç</label>
            <div className="badge-picker">
              {PRESET_BADGES.map(b => (
                <button
                  key={b.name}
                  type="button"
                  className={`badge-picker__item ${selectedBadge?.name === b.name ? 'badge-picker__item--active' : ''}`}
                  onClick={() => setSelectedBadge(b)}
                >
                  <span>{b.icon}</span>
                  <small>{b.name}</small>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="admin-form__row">
            <div className="admin-form__group">
              <label>Rozet Adı</label>
              <input placeholder="Maçın Mimarı" value={customName}
                onChange={e => setCustomName(e.target.value)} />
            </div>
            <div className="admin-form__group" style={{ maxWidth: '120px' }}>
              <label>Emoji</label>
              <input value={customIcon} onChange={e => setCustomIcon(e.target.value)} />
            </div>
          </div>
        )}

        <button className="admin-submit-btn" onClick={handleGive}
          disabled={!selectedPlayer || (badgeMode === 'preset' && !selectedBadge) || (badgeMode === 'custom' && !customName)}>
          🎖️ Rozeti Ver
        </button>

        {status === 'success' && <p className="admin-msg admin-msg--success">✅ Rozet verildi!</p>}
        {status.startsWith('error') && <p className="admin-msg admin-msg--error">❌ {status.replace('error:', '')}</p>}
      </div>
    </div>
  );
}
