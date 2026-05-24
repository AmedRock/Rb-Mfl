import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { FaArrowLeft, FaStar, FaFutbol, FaHandsHelping } from 'react-icons/fa';
import PitchField from '../components/tactics/PitchField';
import { generateSlots, mirrorSlots } from '../utils/formations';
import '../styles/fixtures.css';

function formatDate(d) {
  return new Date(d).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export default function FixtureDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: match, loading, error } = useFetch(`/matches/${id}`);

  if (loading) return (
    <div className="fixture-detail__loading">
      <span>⚽</span> Maç detayları yükleniyor...
    </div>
  );

  if (error || !match) return (
    <div className="fixture-detail__loading">
      <span>❌</span> Maç bulunamadı.
      <button className="player-profile__back" onClick={() => navigate('/fixtures')}>
        <FaArrowLeft /> Geri Dön
      </button>
    </div>
  );

  const teamAWon = match.status === 'completed' && match.teamA.score > match.teamB.score;
  const teamBWon = match.status === 'completed' && match.teamB.score > match.teamA.score;

  // Saha yerleşimi için verileri hazırla
  const hasSquad = match.formation && match.squadAssignments && Object.keys(match.squadAssignments).length > 0;
  
  let teamASlots = [];
  let teamBSlots = [];
  let teamAAssignments = {};
  let teamBAssignments = {};

  if (hasSquad) {
    teamASlots = generateSlots(match.formation);
    teamBSlots = mirrorSlots(teamASlots);
    
    // Tüm oyuncuları lookup için birleştir
    const allPlayers = [...(match.teamA?.players || []), ...(match.teamB?.players || [])];
    
    // Atamaları oluştur
    Object.entries(match.squadAssignments).forEach(([slotId, playerId]) => {
      const playerObj = allPlayers.find(p => p._id === playerId);
      if (playerObj) {
        if (slotId.startsWith('b_')) {
          teamBAssignments[slotId] = playerObj;
        } else {
          teamAAssignments[slotId] = playerObj;
        }
      }
    });
  }

  return (
    <div className="fixture-detail">
      <button className="player-profile__back" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Geri Dön
      </button>

      {/* Başlık */}
      <div className="fixture-detail__header glass-card animate-fade-in">
        <div className="fixture-detail__meta">
          <span className="fixture-detail__format">{match.format}</span>
          <span className="fixture-detail__date">{formatDate(match.date)}</span>
          <span className={`fixture-detail__status ${match.status === 'completed' ? 'status--completed' : 'status--upcoming'}`}>
            {match.status === 'completed' ? '✅ Tamamlandı' : '⏳ Yaklaşan'}
          </span>
        </div>

        {/* Skor */}
        <div className="fixture-detail__score-block">
          <div className={`fixture-detail__team-block ${teamAWon ? 'team-block--winner' : ''}`}>
            <h2>{match.teamA?.name || 'Takım A'}</h2>
            {match.status === 'completed' && (
              <span className="fixture-detail__big-score">{match.teamA.score}</span>
            )}
          </div>
          <span className="fixture-detail__vs">VS</span>
          <div className={`fixture-detail__team-block fixture-detail__team-block--right ${teamBWon ? 'team-block--winner' : ''}`}>
            {match.status === 'completed' && (
              <span className="fixture-detail__big-score">{match.teamB.score}</span>
            )}
            <h2>{match.teamB?.name || 'Takım B'}</h2>
          </div>
        </div>

        {/* MVP */}
        {match.mvp && (
          <div className="fixture-detail__mvp">
            <img
              src={`/players/${match.mvp.photo || 'default.png'}`}
              alt={match.mvp.name}
              onError={e => { e.target.src = '/players/default.png'; }}
            />
            <div>
              <div className="fixture-detail__mvp-label">🏆 Maçın Adamı</div>
              <div className="fixture-detail__mvp-name">{match.mvp.nickname || match.mvp.name}</div>
            </div>
          </div>
        )}
      </div>

      {/* Taktik Tahtası (Kadro) */}
      {hasSquad ? (
        <div className="fixture-detail__pitch-wrapper glass-card animate-fade-in animate-fade-in-delay-1" style={{ padding: '20px', marginBottom: '24px', overflow: 'hidden' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>📋 Maç Kadrosu</h3>
          <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center', marginBottom: '-10%', marginTop: '-15px' }}>
            <PitchField
              teamASlots={teamASlots}
              teamBSlots={teamBSlots}
              teamAAssignments={teamAAssignments}
              teamBAssignments={teamBAssignments}
              onSlotClick={() => {}}
              onRemove={() => {}}
              readOnly={true}
            />
          </div>
        </div>
      ) : (
        <div className="fixture-detail__pitch-wrapper glass-card animate-fade-in animate-fade-in-delay-1" style={{ padding: '40px 20px', textAlign: 'center', marginBottom: '24px', color: 'var(--text-secondary)' }}>
          <h3 style={{ marginBottom: '10px' }}>📋 Maç Kadrosu</h3>
          <p>Bu maç için saha dizilişi bilgisi henüz girilmemiştir.</p>
        </div>
      )}

      {/* Performans İstatistikleri */}
      <div className="fixture-detail__grid">
        {/* Takım A kadrosu */}
        <div className="fixture-detail__squad glass-card animate-fade-in animate-fade-in-delay-1">
          <h3 style={{ color: '#448AFF', marginBottom: '12px' }}>🔵 {match.teamA?.name || 'Takım A'}</h3>
          <ul className="fixture-detail__player-list">
            {(match.teamA?.players || []).map(player => {
              const rating = match.playerRatings?.find(r => r.player?._id === player._id || r.player === player._id);
              const goals = match.goalScorers?.find(g => g.player?._id === player._id);
              const assists = match.assistProviders?.find(a => a.player?._id === player._id);
              const isMvp = match.mvp?._id === player._id;

              return (
                <li key={player._id} className="fixture-detail__player-item">
                  <img
                    src={`/players/${player.photo || 'default.png'}`}
                    alt={player.name}
                    onError={e => { e.target.src = '/players/default.png'; }}
                  />
                  <div className="fixture-detail__player-info">
                    <span className="fixture-detail__player-name">
                      {player.name} {isMvp && '🏆'}
                    </span>
                    <span className="fixture-detail__player-pos">{player.position}</span>
                  </div>
                  <div className="fixture-detail__player-stats">
                    {goals && <span className="stat-pill stat-pill--goal"><FaFutbol /> {goals.count}</span>}
                    {assists && <span className="stat-pill stat-pill--assist"><FaHandsHelping /> {assists.count}</span>}
                    {rating && <span className="stat-pill stat-pill--rating"><FaStar /> {rating.rating}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Takım B kadrosu */}
        <div className="fixture-detail__squad glass-card animate-fade-in animate-fade-in-delay-2">
          <h3 style={{ color: '#FF5252', marginBottom: '12px' }}>🔴 {match.teamB?.name || 'Takım B'}</h3>
          <ul className="fixture-detail__player-list">
            {(match.teamB?.players || []).map(player => {
              const rating = match.playerRatings?.find(r => r.player?._id === player._id || r.player === player._id);
              const goals = match.goalScorers?.find(g => g.player?._id === player._id);
              const assists = match.assistProviders?.find(a => a.player?._id === player._id);
              const isMvp = match.mvp?._id === player._id;

              return (
                <li key={player._id} className="fixture-detail__player-item">
                  <img
                    src={`/players/${player.photo || 'default.png'}`}
                    alt={player.name}
                    onError={e => { e.target.src = '/players/default.png'; }}
                  />
                  <div className="fixture-detail__player-info">
                    <span className="fixture-detail__player-name">
                      {player.name} {isMvp && '🏆'}
                    </span>
                    <span className="fixture-detail__player-pos">{player.position}</span>
                  </div>
                  <div className="fixture-detail__player-stats">
                    {goals && <span className="stat-pill stat-pill--goal"><FaFutbol /> {goals.count}</span>}
                    {assists && <span className="stat-pill stat-pill--assist"><FaHandsHelping /> {assists.count}</span>}
                    {rating && <span className="stat-pill stat-pill--rating"><FaStar /> {rating.rating}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
