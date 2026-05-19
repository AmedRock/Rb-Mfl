import PlayerSlot from './PlayerSlot';

export default function PitchField({
  teamASlots,
  teamBSlots,
  teamAAssignments,
  teamBAssignments,
  onSlotClick,
  onRemove
}) {
  return (
    <div className="pitch">
      {/* Saha çizgileri */}
      <div className="pitch__markings">
        <div className="pitch__center-line" />
        <div className="pitch__center-circle" />
        <div className="pitch__penalty-area pitch__penalty-area--left" />
        <div className="pitch__penalty-area pitch__penalty-area--right" />
        <div className="pitch__goal-area pitch__goal-area--left" />
        <div className="pitch__goal-area pitch__goal-area--right" />
      </div>

      {/* Takım etiketleri */}
      <div className="pitch__team-label pitch__team-label--a">TAKIM A</div>
      <div className="pitch__team-label pitch__team-label--b">TAKIM B</div>

      {/* Takım A slotları (sol yarı) */}
      {teamASlots.map(slot => (
        <PlayerSlot
          key={slot.id}
          slot={slot}
          player={teamAAssignments[slot.id]}
          team="A"
          onClick={() => onSlotClick(slot, 'A')}
          onRemove={(slotId) => onRemove(slotId, 'A')}
        />
      ))}

      {/* Takım B slotları (sağ yarı) */}
      {teamBSlots.map(slot => (
        <PlayerSlot
          key={slot.id}
          slot={slot}
          player={teamBAssignments[slot.id]}
          team="B"
          onClick={() => onSlotClick(slot, 'B')}
          onRemove={(slotId) => onRemove(slotId, 'B')}
        />
      ))}
    </div>
  );
}
