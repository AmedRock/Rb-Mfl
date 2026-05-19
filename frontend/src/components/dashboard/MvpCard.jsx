export default function MvpCard({ match }) {
  if (!match || !match.mvp) {
    return (
      <div className="mvp-section glass-card">
        <h3 className="mvp-section__title">🏆 Son Maçın MVP'si</h3>
        <div className="mvp-section__empty">
          Henüz MVP seçilmedi.
        </div>
      </div>
    );
  }

  const { mvp } = match;
  const mvpRating = match.playerRatings?.find(
    pr => pr.player?._id === mvp._id || pr.player === mvp._id
  );

  return (
    <div className="mvp-section glass-card">
      <h3 className="mvp-section__title">🏆 Son Maçın MVP'si</h3>
      <div className="mvp-section__card">
        <img
          className="mvp-section__photo"
          src={`/players/${mvp.photo || 'default.png'}`}
          alt={mvp.name}
          onError={(e) => { e.target.src = '/players/default.png'; }}
        />
        <div className="mvp-section__name">{mvp.nickname || mvp.name}</div>
        {mvpRating && (
          <div className="mvp-section__rating">{mvpRating.rating}/10</div>
        )}
      </div>
    </div>
  );
}
