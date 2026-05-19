import { useState, useEffect } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { apiAuthPut, apiAuthGet } from '../../hooks/useAuth';

const STAT_KEYS = ['pace','shooting','passing','dribbling','defending','physical'];
const STAT_LABELS = { pace:'Hız', shooting:'Şut', passing:'Pas', dribbling:'Dribling', defending:'Defans', physical:'Fiziksel' };

export default function PendingPlayersTab({ authHeader }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allPlayers, setAllPlayers] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [approveStats, setApproveStats] = useState({});
  const [approveMarket, setApproveMarket] = useState(50);
  const [rejectMsg, setRejectMsg] = useState('');
  const [linkTarget, setLinkTarget] = useState('');
  const [status, setStatus] = useState('');

  const fetchPending = async () => {
    setLoading(true);
    try {
      const data = await apiAuthGet('/admin/pending-players', authHeader);
      setPending(data);
    } catch { setPending([]); }
    setLoading(false);
  };

  const fetchAllPlayers = async () => {
    try {
      const res = await fetch('/api/players');
      const data = await res.json();
      setAllPlayers(data.filter(p => p.accountStatus === 'none' || !p.accountStatus));
    } catch { setAllPlayers([]); }
  };

  useEffect(() => { fetchPending(); fetchAllPlayers(); }, []);

  const handleExpand = (player) => {
    setExpandedId(expandedId === player._id ? null : player._id);
    setApproveStats(player.stats || { pace:50, shooting:50, passing:50, dribbling:50, defending:50, physical:50 });
    setApproveMarket(player.marketValue || 50);
    setRejectMsg(''); setLinkTarget(''); setStatus('');
  };

  const handleApprove = async (id) => {
    setStatus('');
    try {
      await apiAuthPut(`/admin/player/${id}/approve`, {
        stats: approveStats, marketValue: Number(approveMarket)
      }, authHeader);
      setStatus('approved');
      fetchPending();
    } catch (err) { setStatus('error:' + err.message); }
  };

  const handleReject = async (id) => {
    setStatus('');
    try {
      await apiAuthPut(`/admin/player/${id}/reject`, { message: rejectMsg || 'Red sebebi belirtilmedi' }, authHeader);
      setStatus('rejected');
      fetchPending();
    } catch (err) { setStatus('error:' + err.message); }
  };

  const handleLink = async (existingId, pendingId) => {
    setStatus('');
    try {
      await apiAuthPut(`/admin/player/${existingId}/link`, { pendingPlayerId: pendingId }, authHeader);
      setStatus('linked');
      fetchPending(); fetchAllPlayers();
    } catch (err) { setStatus('error:' + err.message); }
  };

  const handleStat = (key, val) => {
    setApproveStats(prev => ({ ...prev, [key]: Math.min(99, Math.max(1, Number(val))) }));
  };

  return (
    <div className="admin-tab">
      <h2 className="admin-tab__title">👤 Hesap Onayları</h2>
      <p className="admin-tab__desc">Oyuncuların hesap açma başvurularını gözden geçirin.</p>

      {loading && <p className="admin-msg admin-msg--info">Yükleniyor...</p>}
      {!loading && pending.length === 0 && (
        <p className="admin-msg admin-msg--info">🎉 Bekleyen başvuru yok</p>
      )}

      <div className="admin-player-list">
        {pending.map(player => (
          <div key={player._id} className="pending-card glass-card">
            <div className="pending-card__header" onClick={() => handleExpand(player)}>
              <img src={`/players/${player.photo || 'default.png'}`} alt={player.name}
                onError={e => { e.target.onerror = null; e.target.src = '/players/default.png'; }} />
              <div className="pending-card__info">
                <span className="pending-card__name">{player.name} {player.nickname && `"${player.nickname}"`}</span>
                <span className="pending-card__meta">#{player.number} · {player.position} · {player.email}</span>
              </div>
              <span className="pending-card__badge">⏳ Bekliyor</span>
            </div>

            {expandedId === player._id && (
              <div className="pending-card__detail">
                {player.motto && <p className="pending-card__motto">💬 "{player.motto}"</p>}

                {/* Admin stat editörü */}
                <div className="admin-form__group">
                  <label>⚽ Statlar (Admin doldurur)</label>
                  <div className="stat-editor">
                    {STAT_KEYS.map(key => (
                      <div key={key} className="stat-editor__row">
                        <span className="stat-editor__label">{STAT_LABELS[key]}</span>
                        <input type="range" min="1" max="99" value={approveStats[key] || 50}
                          onChange={e => handleStat(key, e.target.value)} />
                        <input type="number" min="1" max="99" className="stat-editor__num"
                          value={approveStats[key] || 50} onChange={e => handleStat(key, e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="admin-form__group">
                  <label>Piyasa Değeri (M)</label>
                  <input type="number" min="20" max="200" value={approveMarket}
                    onChange={e => setApproveMarket(e.target.value)} />
                </div>

                {/* Mevcut oyuncuyla eşleştir */}
                {allPlayers.length > 0 && (
                  <div className="admin-form__group">
                    <label>🔗 Mevcut oyuncuyla eşleştir (isteğe bağlı)</label>
                    <div className="admin-form__row">
                      <select value={linkTarget} onChange={e => setLinkTarget(e.target.value)} style={{ flex: 1 }}>
                        <option value="">Yeni oyuncu olarak onayla</option>
                        {allPlayers.map(p => (
                          <option key={p._id} value={p._id}>{p.name} ({p.position} · OVR {p.overall})</option>
                        ))}
                      </select>
                      {linkTarget && (
                        <button className="admin-action-btn" onClick={() => handleLink(linkTarget, player._id)}>
                          🔗 Eşleştir
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Aksiyonlar */}
                <div className="pending-card__actions">
                  <button className="admin-submit-btn" onClick={() => handleApprove(player._id)}>
                    ✅ Onayla
                  </button>
                  <div className="pending-card__reject-row">
                    <input placeholder="Red sebebi..." value={rejectMsg}
                      onChange={e => setRejectMsg(e.target.value)} />
                    <button className="admin-submit-btn admin-submit-btn--danger"
                      onClick={() => handleReject(player._id)}>
                      ❌ Reddet
                    </button>
                  </div>
                </div>

                {status === 'approved' && <p className="admin-msg admin-msg--success">✅ Oyuncu onaylandı!</p>}
                {status === 'rejected' && <p className="admin-msg admin-msg--success">Başvuru reddedildi.</p>}
                {status === 'linked' && <p className="admin-msg admin-msg--success">✅ Mevcut oyuncuyla eşleştirildi!</p>}
                {status.startsWith?.('error') && <p className="admin-msg admin-msg--error">❌ {status.replace('error:','')}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
