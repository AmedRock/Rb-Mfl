import { playerScore } from '../../utils/teamBalancer';

/**
 * Oyuncuların rol bilgisiyle ağırlıklı toplam skorunu hesaplar.
 * slots dizisi varsa slot.role kullanılır; yoksa 'MID' varsayılan.
 */
function calcTeamScore(assignments, slots = []) {
  const roleMap = Object.fromEntries(slots.map(s => [s.id, s.role]));
  return Object.entries(assignments)
    .filter(([, p]) => p)
    .reduce((sum, [slotId, p]) => {
      const role = roleMap[slotId] || 'MID';
      return sum + playerScore(p, role);
    }, 0);
}

export default function TeamPowerBar({ teamAPlayers, teamBPlayers, teamASlots = [], teamBSlots = [], teamAAssignments = {}, teamBAssignments = {} }) {
  // Eğer assignments map'i geçilmişse rol-bazlı, değilse oyuncu listesiyle genel skor
  const scoreA = teamASlots.length > 0 && Object.keys(teamAAssignments).length > 0
    ? calcTeamScore(teamAAssignments, teamASlots)
    : teamAPlayers.filter(Boolean).reduce((s, p) => s + playerScore(p, 'MID'), 0);

  const scoreB = teamBSlots.length > 0 && Object.keys(teamBAssignments).length > 0
    ? calcTeamScore(teamBAssignments, teamBSlots)
    : teamBPlayers.filter(Boolean).reduce((s, p) => s + playerScore(p, 'MID'), 0);

  const maxScore = Math.max(scoreA, scoreB, 1);
  const diff     = Math.abs(scoreA - scoreB);

  const barWidthA = (scoreA / maxScore) * 100;
  const barWidthB = (scoreB / maxScore) * 100;

  // Fark eşiklerini oyuncu sayısına göre ölçekle (dinamik)
  const playerCount  = Math.max(teamAPlayers.length, teamBPlayers.length, 1);
  const thresholdGood = playerCount * 1.5;   // "Dengeli" sınırı
  const thresholdBad  = playerCount * 3.5;   // "Dengesiz" sınırı

  let balanceStatus = 'balanced';
  let balanceLabel  = '⚖️ Dengeli';
  if (diff > thresholdBad) {
    balanceStatus = 'unbalanced';
    balanceLabel  = '⚠️ Dengesiz';
  } else if (diff > thresholdGood) {
    balanceStatus = 'slightly';
    balanceLabel  = '↕️ Hafif Fark';
  }

  // Güç yüzdesi (max 100 üzerinden normalize)
  const pctA = Math.round((scoreA / (scoreA + scoreB || 1)) * 100);
  const pctB = 100 - pctA;

  return (
    <div className="power-bar">
      <div className="power-bar__header">
        <span className="power-bar__label power-bar__label--a">Takım A</span>
        <span className={`power-bar__balance power-bar__balance--${balanceStatus}`}>
          {balanceLabel}
        </span>
        <span className="power-bar__label power-bar__label--b">Takım B</span>
      </div>

      <div className="power-bar__bars">
        <div className="power-bar__side power-bar__side--a">
          <div
            className="power-bar__fill power-bar__fill--a"
            style={{ width: `${barWidthA}%` }}
          />
        </div>
        <div className="power-bar__vs">VS</div>
        <div className="power-bar__side power-bar__side--b">
          <div
            className="power-bar__fill power-bar__fill--b"
            style={{ width: `${barWidthB}%` }}
          />
        </div>
      </div>

      <div className="power-bar__scores">
        <span className="power-bar__score power-bar__score--a">
          {scoreA.toFixed(1)}
          <span className="power-bar__pct"> ({pctA}%)</span>
        </span>
        <span className="power-bar__diff">Fark: {diff.toFixed(1)}</span>
        <span className="power-bar__score power-bar__score--b">
          {scoreB.toFixed(1)}
          <span className="power-bar__pct"> ({pctB}%)</span>
        </span>
      </div>
    </div>
  );
}
