import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { apiAuthPost, apiAuthDelete } from '../../hooks/useAuth';

export default function ScandalTab({ authHeader }) {
  const { data: players } = useFetch('/players');
  const { data: scandals, refetch } = useFetch('/admin/scandals');
  const [form, setForm] = useState({ targetPlayer: '', headline: '', impactPercent: -15 });
  const [status, setStatus] = useState('');
  const [preview, setPreview] = useState(null);

  const selectedPlayer = players?.find(p => p._id === form.targetPlayer);

  const handlePlayerChange = (e) => {
    const p = players?.find(pl => pl._id === e.target.value);
    setForm({ ...form, targetPlayer: e.target.value });
    if (p) {
      const newVal = Math.max(20, Math.round(p.marketValue * (1 + form.impactPercent / 100)));
      setPreview({ old: p.marketValue, new: newVal });
    }
  };

  const handleImpactChange = (val) => {
    setForm({ ...form, impactPercent: Number(val) });
    if (selectedPlayer) {
      const newVal = Math.max(20, Math.round(selectedPlayer.marketValue * (1 + val / 100)));
      setPreview({ old: selectedPlayer.marketValue, new: newVal });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    try {
      await apiAuthPost('/admin/scandal', form, authHeader);
      setStatus('success');
      setForm({ targetPlayer: '', headline: '', impactPercent: -15 });
      setPreview(null);
      refetch();
    } catch (err) {
      setStatus('error:' + err.message);
    }
  };

  const handleRemoveScandal = async (id) => {
    try {
      await apiAuthDelete(`/admin/scandal/${id}`, authHeader);
      refetch();
    } catch (err) {
      alert('Hata: ' + err.message);
    }
  };

  return (
    <div className="admin-tab">
      <h2 className="admin-tab__title">📰 SPK Bildirimi — Skandal Merkezi</h2>
      <p className="admin-tab__desc">Oyuncunun piyasa değerini kalıcı olarak etkileyen skandal haberi giriniz.</p>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form__group">
          <label>Hedef Oyuncu</label>
          <select value={form.targetPlayer} onChange={handlePlayerChange} required>
            <option value="">-- Oyuncu seçin --</option>
            {(players || []).map(p => (
              <option key={p._id} value={p._id}>{p.name} · {p.marketValue}M</option>
            ))}
          </select>
        </div>

        <div className="admin-form__group">
          <label>Manşet</label>
          <input placeholder="Soyunma odasında gerginlik! Kaptan istifada..." required
            value={form.headline} onChange={e => setForm({ ...form, headline: e.target.value })} />
        </div>

        <div className="admin-form__group">
          <label>Piyasa Etkisi: <strong style={{ color: 'var(--accent-red)' }}>{form.impactPercent}%</strong></label>
          <input type="range" min="-50" max="-1" value={form.impactPercent}
            onChange={e => handleImpactChange(e.target.value)} />
        </div>

        {preview && (
          <div className="scandal-preview">
            <span className="scandal-preview__old">{preview.old}M</span>
            <span>→</span>
            <span className="scandal-preview__new">{preview.new}M</span>
            <span className="scandal-preview__diff">({form.impactPercent}%)</span>
          </div>
        )}

        <button type="submit" className="admin-submit-btn admin-submit-btn--danger">
          🚨 Skandalı Yayınla
        </button>

        {status === 'success' && <p className="admin-msg admin-msg--success">✅ Skandal yayınlandı!</p>}
        {status.startsWith('error') && <p className="admin-msg admin-msg--error">❌ {status.replace('error:', '')}</p>}
      </form>

      {/* Aktif skandallar */}
      {scandals && scandals.length > 0 && (
        <div className="admin-form__group" style={{ marginTop: '24px' }}>
          <label>🔴 Aktif Skandallar</label>
          <div className="active-scandals">
            {scandals.map(s => (
              <div key={s._id} className="active-scandal glass-card">
                <img src={`/players/${s.targetPlayer?.photo || 'default.png'}`} alt=""
                  onError={e => { e.target.src = '/players/default.png'; }} />
                <div className="active-scandal__info">
                  <span className="active-scandal__name">{s.targetPlayer?.name}</span>
                  <span className="active-scandal__headline">{s.headline}</span>
                  <span className="active-scandal__impact">{s.impactPercent}%</span>
                </div>
                <button className="admin-action-btn admin-action-btn--danger"
                  onClick={() => handleRemoveScandal(s._id)}>Kaldır</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
