import { teamTotalScore, playerScore } from '../../utils/teamBalancer';

export default function TeamPowerBar({ teamAPlayers, teamBPlayers }) {
  const scoreA = teamTotalScore(teamAPlayers.filter(Boolean));
  const scoreB = teamTotalScore(teamBPlayers.filter(Boolean));
  const maxScore = Math.max(scoreA, scoreB, 1);
  const diff = Math.abs(scoreA - scoreB);
  
  const barWidthA = (scoreA / maxScore) * 100;
  const barWidthB = (scoreB / maxScore) * 100;

  // Denge durumu
  let balanceStatus = 'balanced';
  let balanceLabel = '⚖️ Dengeli';
  if (diff > 20) {
    balanceStatus = 'unbalanced';
    balanceLabel = '⚠️ Dengesiz';
  } else if (diff > 8) {
    balanceStatus = 'slightly';
    balanceLabel = '↕️ Hafif Fark';
  }

  return (
    <div className="power-bar">
      <div className="power-bar__header">
        <span className="power-bar__label power-bar__label--a">
          Takım A
        </span>
        <span className={`power-bar__balance power-bar__balance--${balanceStatus}`}>
          {balanceLabel}
        </span>
        <span className="power-bar__label power-bar__label--b">
          Takım B
        </span>
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
        </span>
        <span className="power-bar__diff">
          Fark: {diff.toFixed(1)}
        </span>
        <span className="power-bar__score power-bar__score--b">
          {scoreB.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
