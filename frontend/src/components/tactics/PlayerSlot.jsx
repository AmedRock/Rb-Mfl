export default function PlayerSlot({ slot, player, team, onClick, onRemove }) {
  const isEmpty = !player;
  const teamClass = team === 'A' ? 'slot--team-a' : 'slot--team-b';

  return (
    <div
      className={`player-slot ${teamClass} ${isEmpty ? 'player-slot--empty' : 'player-slot--filled'}`}
      style={{
        left: `${slot.x}%`,
        top: `${slot.y}%`
      }}
      onClick={() => isEmpty && onClick && onClick(slot)}
      role="button"
      tabIndex={0}
      title={isEmpty ? `${slot.role} seç` : player.name}
    >
      {isEmpty ? (
        <>
          <div className="player-slot__circle">
            <span className="player-slot__plus">+</span>
          </div>
          <span className="player-slot__role">{slot.role}</span>
        </>
      ) : (
        <>
          <div className="player-slot__avatar">
            <img
              src={`/players/${player.photo || 'default.png'}`}
              alt={player.name}
              onError={(e) => { e.target.src = '/players/default.png'; }}
            />
            <span className="player-slot__ovr">{player.overall}</span>
          </div>
          <span className="player-slot__name">
            {player.nickname || player.name.split(' ')[0]}
          </span>
          <button
            className="player-slot__remove"
            onClick={(e) => {
              e.stopPropagation();
              onRemove && onRemove(slot.id);
            }}
            title="Kaldır"
          >
            ×
          </button>
        </>
      )}
    </div>
  );
}
