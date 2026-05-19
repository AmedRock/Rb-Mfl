import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { apiAuthPut } from '../../hooks/useAuth';

const RATING_BUTTONS = [
  { value: 5, label: 'Kötü', color: '#FF1744' },
  { value: 6, label: 'Orta', color: '#FF9100' },
  { value: 7, label: 'İyi', color: '#FFD600' },
  { value: 8, label: 'Çok İyi', color: '#69F0AE' },
  { value: 9, label: 'Harika', color: '#00E676' },
  { value: 10, label: 'Efsane', color: '#FFD700' }
];

export default function SubmitResultTab({ authHeader }) {
  const { data: matches } = useFetch('/matches');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [teamAScore, setTeamAScore] = useState('');
  const [teamBScore, setTeamBScore] = useState('');
  const [mvp, setMvp] = useState('');
  const [ratings, setRatings] = useState({}); // { playerId: rating }
  const [goals, setGoals] = useState({}); // { playerId: count }
  const [assists, setAssists] = useState({}); // { playerId: count }
  const [status, setStatus] = useState('');

  const upcoming = (matches || []).filter(m => m.status === 'upcoming');
  const allPlayers = selectedMatch
    ? [...(selectedMatch.teamA?.players || []), ...(selectedMatch.teamB?.players || [])]
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    try {
      const playerRatings = Object.entries(ratings).map(([player, rating]) => ({ player, rating }));
      const goalScorers = Object.entries(goals).filter(([, c]) => c > 0).map(([player, count]) => ({ player, count }));
      const assistProviders = Object.entries(assists).filter(([, c]) => c > 0).map(([player, count]) => ({ player, count }));

      await apiAuthPut(`/matches/${selectedMatch._id}/result`, {
        teamAScore: Number(teamAScore),
        teamBScore: Number(teamBScore),
        mvp: mvp || null,
        playerRatings,
        goalScorers,
        assistProviders
      }, authHeader);

      setStatus('success');
      setSelectedMatch(null);
      setRatings({}); setGoals({}); setAssists({});
      setTeamAScore(''); setTeamBScore(''); setMvp('');
    } catch (err) {
      setStatus('error:' + err.message);
    }
  };

  return (
    <div className="admin-tab">
      <h2 className="admin-tab__title">🏆 Sonuç Gir</h2>
      <p className="admin-tab__desc">Tamamlanan maçın sonucunu ve oyuncu performanslarını girin.</p>

      {/* Maç seçici */}
      <div className="admin-form__group">
        <label>Maç Seç</label>
        <select
          onChange={e => {
            const m = upcoming.find(u => u._id === e.target.value);
            setSelectedMatch(m || null);
            setRatings({}); setGoals({}); setAssists({});
          }}
          value={selectedMatch?._id || ''}
        >
          <option value="">-- Maç seçin --</option>
          {upcoming.map(m => (
            <option key={m._id} value={m._id}>
              {new Date(m.date).toLocaleDateString('tr-TR')} · {m.format} · {m.teamA?.name} vs {m.teamB?.name}
            </option>
          ))}
        </select>
      </div>

      {upcoming.length === 0 && (
        <p className="admin-msg admin-msg--info">Bekleyen maç yok. Önce maç ekleyin.</p>
      )}

      {selectedMatch && (
        <form className="admin-form" onSubmit={handleSubmit}>
          {/* Skor */}
          <div className="admin-form__row">
            <div className="admin-form__group">
              <label>{selectedMatch.teamA?.name} Golü</label>
              <input type="number" min="0" value={teamAScore}
                onChange={e => setTeamAScore(e.target.value)} required />
            </div>
            <div className="admin-form__vs-badge">VS</div>
            <div className="admin-form__group">
              <label>{selectedMatch.teamB?.name} Golü</label>
              <input type="number" min="0" value={teamBScore}
                onChange={e => setTeamBScore(e.target.value)} required />
            </div>
          </div>

          {/* MVP */}
          <div className="admin-form__group">
            <label>🏆 Maçın Adamı (MVP)</label>
            <select value={mvp} onChange={e => setMvp(e.target.value)}>
              <option value="">-- MVP seçin --</option>
              {allPlayers.map(p => (
                <option key={p._id} value={p._id}>{p.name} ({p.position})</option>
              ))}
            </select>
          </div>

          {/* Oyuncu Notları */}
          <div className="admin-form__group">
            <label>⭐ Oyuncu Performansları</label>
            <div className="result-players">
              {allPlayers.map(player => (
                <div key={player._id} className="result-player glass-card">
                  <div className="result-player__header">
                    <img
                      src={`/players/${player.photo || 'default.png'}`}
                      alt={player.name}
                      onError={e => { e.target.src = '/players/default.png'; }}
                    />
                    <div>
                      <span className="result-player__name">{player.name}</span>
                      <span className="result-player__pos">{player.position}</span>
                    </div>
                    {/* Gol / Asist */}
                    <div className="result-player__counters">
                      <label>⚽</label>
                      <input type="number" min="0" max="15"
                        value={goals[player._id] || 0}
                        onChange={e => setGoals({ ...goals, [player._id]: Number(e.target.value) })}
                      />
                      <label>🎯</label>
                      <input type="number" min="0" max="15"
                        value={assists[player._id] || 0}
                        onChange={e => setAssists({ ...assists, [player._id]: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  {/* Puan Butonları */}
                  <div className="result-player__ratings">
                    {RATING_BUTTONS.map(btn => (
                      <button
                        key={btn.value}
                        type="button"
                        className={`rating-btn ${ratings[player._id] === btn.value ? 'rating-btn--active' : ''}`}
                        style={ratings[player._id] === btn.value ? { background: btn.color, color: '#000', borderColor: btn.color } : {}}
                        onClick={() => setRatings({ ...ratings, [player._id]: btn.value })}
                      >
                        {btn.value}<br />
                        <small>{btn.label}</small>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="admin-submit-btn">
            ✅ Sonucu Kaydet & Borsayı Güncelle
          </button>

          {status === 'success' && <p className="admin-msg admin-msg--success">✅ Sonuç kaydedildi, borsa güncellendi!</p>}
          {status.startsWith('error') && <p className="admin-msg admin-msg--error">❌ {status.replace('error:', '')}</p>}
        </form>
      )}
    </div>
  );
}
