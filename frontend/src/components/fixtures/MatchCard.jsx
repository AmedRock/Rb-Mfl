import { useNavigate } from 'react-router-dom';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export default function MatchCard({ match, onClick, onDelete, isAdmin }) {
  const isUpcoming = match.status === 'upcoming';
  const isCompleted = match.status === 'completed';
  const teamAWon = isCompleted && match.teamA.score > match.teamB.score;
  const teamBWon = isCompleted && match.teamB.score > match.teamA.score;

  return (
    <div
      className={`match-card ${isUpcoming ? 'match-card--upcoming' : 'match-card--completed'}`}
      onClick={() => onClick && onClick(match)}
      role="button"
      tabIndex={0}
    >
      {/* Durum rozeti */}
      <div className="match-card__status-badge">
        {isUpcoming ? '⏳ Yaklaşan' : '✅ Tamamlandı'}
      </div>

      {/* Format */}
      <div className="match-card__format">{match.format}</div>

      {/* Skor / vs bölümü */}
      <div className="match-card__score-row">
        <div className={`match-card__team ${teamAWon ? 'match-card__team--winner' : ''}`}>
          <span className="match-card__team-name">{match.teamA?.name || 'Takım A'}</span>
          {isCompleted && (
            <span className="match-card__score">{match.teamA.score}</span>
          )}
        </div>

        <span className="match-card__vs">VS</span>

        <div className={`match-card__team match-card__team--right ${teamBWon ? 'match-card__team--winner' : ''}`}>
          {isCompleted && (
            <span className="match-card__score">{match.teamB.score}</span>
          )}
          <span className="match-card__team-name">{match.teamB?.name || 'Takım B'}</span>
        </div>
      </div>

      {/* MVP */}
      {isCompleted && match.mvp && (
        <div className="match-card__mvp">
          <img
            src={`/players/${match.mvp.photo || 'default.png'}`}
            alt={match.mvp.name}
            onError={e => { e.target.src = '/players/default.png'; }}
          />
          <span>🏆 {match.mvp.nickname || match.mvp.name}</span>
        </div>
      )}

      {/* Tarih */}
      <div className="match-card__date">{formatDate(match.date)}</div>

      {/* Admin: Sil butonu */}
      {isAdmin && (
        <button
          className="match-card__delete"
          onClick={e => { e.stopPropagation(); onDelete && onDelete(match._id); }}
          title="Maçı Sil"
        >
          🗑️
        </button>
      )}
    </div>
  );
}
