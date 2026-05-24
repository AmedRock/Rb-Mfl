import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import RadarChart from '../profile/RadarChart';
import MarketChart from '../profile/MarketChart';
import BadgeList from '../profile/BadgeList';

function getCardTier(ovr) {
  if (ovr >= 85) return 'gold';
  if (ovr >= 70) return 'silver';
  return 'bronze';
}

function getStatFill(v) {
  if (v >= 80) return 'high';
  if (v >= 60) return 'mid';
  return 'low';
}

export default function MyProfilePanel({ onLogout }) {
  const { getPlayerToken, playerAuthHeader, getPlayerData } = useAuth();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me', { headers: playerAuthHeader() });
      const data = await res.json();
      if (res.ok) { setPlayer(data); }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchProfile(); }, []);

  const openEdit = () => {
    setForm({
      nickname: player.nickname || '',
      motto: player.motto || '',
      photo: player.photo || 'default.png'
    });
    setPhotoFile(null);
    setPreviewUrl(null);
    setEditing(true);
    setSaveMsg('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true); setSaveMsg('');
    try {
      let uploadedFilename = form.photo;

      // Yeni fotoğraf seçildiyse önce yükle
      if (photoFile) {
        const formData = new FormData();
        formData.append('photo', photoFile);
        const uploadRes = await fetch('/api/auth/upload-photo', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${getPlayerToken()}` },
          body: formData
        });
        if (!uploadRes.ok) throw new Error('Fotoğraf yüklenemedi');
        const uploadData = await uploadRes.json();
        uploadedFilename = uploadData.filename;
      }

      const res = await fetch(`/api/players/${player._id}`, {
        method: 'PUT',
        headers: playerAuthHeader(),
        body: JSON.stringify({
          nickname: form.nickname,
          motto: form.motto,
          photo: uploadedFilename
        })
      });
      if (res.ok) {
        setSaveMsg('success');
        setEditing(false);
        setPhotoFile(null);
        setPreviewUrl(null);
        fetchProfile();
      } else {
        const err = await res.json();
        setSaveMsg('error:' + (err.message || 'Hata'));
      }
    } catch (err) { setSaveMsg('error:' + err.message); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="my-profile">
      <div className="fixture-detail__loading"><span>⚽</span> Profiliniz yükleniyor...</div>
    </div>
  );

  if (!player) return (
    <div className="my-profile">
      <div className="fixture-detail__loading"><span>❌</span> Profil bulunamadı</div>
    </div>
  );

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
    <div className="my-profile">
      {/* Aksiyon butonları */}
      <div className="my-profile__actions">
        {!editing && (
          <button className="admin-action-btn" onClick={openEdit}>✏️ Düzenle</button>
        )}
        <button className="admin-logout-btn" onClick={onLogout}>Çıkış Yap</button>
      </div>

      {/* Düzenleme modu */}
      {editing && (
        <div className="my-profile__edit glass-card animate-fade-in">
          <h3>✏️ Profilini Düzenle</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '12px' }}>
            Statlar ve piyasa değeri yalnızca admin tarafından değiştirilebilir.
          </p>
          <div className="admin-form">
            {/* Profil Fotoğrafı */}
            <div className="admin-form__group">
              <label>Profil Fotoğrafı</label>
              <div className="my-profile__photo-upload">
                <label className="my-profile__photo-label" htmlFor="player-photo-input">
                  <img
                    className="my-profile__photo-preview"
                    src={previewUrl || `/players/${form.photo || 'default.png'}`}
                    alt="Profil fotoğrafı önizleme"
                    onError={e => { e.target.onerror = null; e.target.src = '/players/default.png'; }}
                  />
                  <div className="my-profile__photo-overlay">
                    <span>📷</span>
                    <span>Fotoğraf Değiştir</span>
                  </div>
                </label>
                <input
                  id="player-photo-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                {photoFile && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '6px', textAlign: 'center' }}>
                    📎 {photoFile.name}
                  </p>
                )}
              </div>
            </div>
            <div className="admin-form__group">
              <label>Lakap</label>
              <input value={form.nickname} onChange={e => setForm({...form, nickname: e.target.value})} />
            </div>
            <div className="admin-form__group">
              <label>Motto</label>
              <textarea rows="2" value={form.motto} onChange={e => setForm({...form, motto: e.target.value})} />
            </div>
            <div className="admin-form__row">
              <button className="admin-submit-btn" onClick={handleSave} disabled={saving}>
                {saving ? '⏳ Kaydediliyor...' : '💾 Kaydet'}
              </button>
              <button className="admin-back-btn" onClick={() => { setEditing(false); setPhotoFile(null); setPreviewUrl(null); }}>İptal</button>
            </div>
            {saveMsg === 'success' && <p className="admin-msg admin-msg--success">✅ Profil güncellendi!</p>}
            {saveMsg.startsWith?.('error') && <p className="admin-msg admin-msg--error">❌ {saveMsg.replace('error:','')}</p>}
          </div>
        </div>
      )}

      {/* Profil içeriği — PlayerProfile'ın kısaltılmış versiyonu */}
      <div className="player-profile__hero animate-fade-in">
        <div className={`player-profile__big-card ${tier}`}>
          <span className="player-profile__big-number">#{player.number}</span>
          <div className="player-profile__big-ovr">{player.overall}</div>
          <div className="player-profile__big-pos">{player.position}</div>
          <img className="player-profile__big-photo"
            src={`/players/${player.photo || 'default.png'}`} alt={player.name}
            onError={e => { e.target.onerror = null; e.target.src = '/players/default.png'; }} />
          <div className="player-profile__big-name">{player.name}</div>
          {player.nickname && <div className="player-profile__big-nickname">"{player.nickname}"</div>}
          <div className="big-card-stats">
            {stats.map(s => (
              <div key={s.key} className="big-card-stat">
                <span className="big-card-stat__label">{s.label}</span>
                <div className="big-card-stat__bar">
                  <div className={`big-card-stat__fill ${getStatFill(s.value)}`}
                    style={{ width: `${(s.value / 99) * 100}%` }} />
                </div>
                <span className={`big-card-stat__value stat-${getStatFill(s.value)}`}>{s.value}</span>
              </div>
            ))}
          </div>
          <div className="player-profile__big-market"><span className="value">{player.marketValue}M</span> €</div>
        </div>

        <div className="player-profile__bio">
          {player.motto && (
            <div className="player-profile__motto glass-card">
              <p className="player-profile__motto-text">{player.motto}</p>
            </div>
          )}
          {player.tags?.length > 0 && (
            <div className="player-profile__tags">
              {player.tags.map((t, i) => <span key={i} className="player-profile__tag">{t}</span>)}
            </div>
          )}
          <div className="player-profile__career glass-card">
            <h3>📊 Kariyer İstatistikleri</h3>
            <div className="career-grid">
              <div className="career-stat"><div className="career-stat__value">{career.matches || 0}</div><div className="career-stat__label">Maç</div></div>
              <div className="career-stat"><div className="career-stat__value">{career.goals || 0}</div><div className="career-stat__label">Gol</div></div>
              <div className="career-stat"><div className="career-stat__value">{career.assists || 0}</div><div className="career-stat__label">Asist</div></div>
              <div className="career-stat"><div className="career-stat__value">{career.mvpCount || 0}</div><div className="career-stat__label">MVP</div></div>
              <div className="career-stat"><div className="career-stat__value">{career.avgRating?.toFixed(1) || '0.0'}</div><div className="career-stat__label">Ort. Puan</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Grafikler */}
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

      {/* Rozetler */}
      <div className="player-profile__badges animate-fade-in animate-fade-in-delay-3">
        <h3>🏅 Rozetlerim</h3>
        <BadgeList badges={player.badges || []} />
      </div>
    </div>
  );
}
