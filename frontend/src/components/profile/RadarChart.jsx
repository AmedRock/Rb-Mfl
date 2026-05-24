import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

const STAT_LABELS = {
  pace:      'Hız',
  shooting:  'Şut',
  passing:   'Pas',
  dribbling: 'Dribling',
  defending: 'Defans',
  physical:  'Fiziksel'
};

/* ── Renk yardımcısı ── */
function statColor(value) {
  if (value >= 80) return '#00E676';   // yüksek → yeşil
  if (value >= 60) return '#FFD700';   // orta   → altın
  return '#FF1744';                    // düşük  → kırmızı
}

/* ── Özel Tooltip ── */
function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const { stat, value } = payload[0].payload;
  const color = statColor(value);
  return (
    <div style={{
      background: 'rgba(13, 13, 26, 0.95)',
      border: `1px solid ${color}40`,
      borderRadius: '10px',
      padding: '10px 16px',
      boxShadow: `0 4px 20px rgba(0,0,0,0.6), 0 0 12px ${color}20`,
      minWidth: '110px',
      textAlign: 'center',
      pointerEvents: 'none'
    }}>
      <p style={{
        color: '#8A8A9A',
        fontSize: '0.7rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        margin: '0 0 4px 0'
      }}>
        {stat}
      </p>
      <p style={{
        color,
        fontSize: '1.5rem',
        fontWeight: 800,
        fontFamily: 'Outfit, sans-serif',
        margin: 0,
        lineHeight: 1
      }}>
        {value}
      </p>
      <div style={{
        marginTop: '6px',
        height: '3px',
        borderRadius: '2px',
        background: `linear-gradient(90deg, ${color}00, ${color}, ${color}00)`,
        opacity: 0.6
      }} />
    </div>
  );
}

export default function RadarChart({ stats }) {
  if (!stats) return null;

  const data = Object.entries(STAT_LABELS).map(([key, label]) => ({
    stat: label,
    value: stats[key] || 0,
    fullMark: 99
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RechartsRadar cx="50%" cy="50%" outerRadius="75%" data={data}>
        <PolarGrid
          stroke="rgba(255,255,255,0.08)"
          gridType="polygon"
        />
        <PolarAngleAxis
          dataKey="stat"
          tick={{
            fill: '#8A8A9A',
            fontSize: 11,
            fontFamily: 'Inter, sans-serif'
          }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 99]}
          tick={false}
          axisLine={false}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={false}
        />
        <Radar
          name="Statlar"
          dataKey="value"
          stroke="#FFD700"
          fill="#FFD700"
          fillOpacity={0.15}
          strokeWidth={2}
          dot={{
            r: 4,
            fill: '#FFD700',
            strokeWidth: 0
          }}
          activeDot={{
            r: 6,
            fill: '#FFD700',
            stroke: '#fff',
            strokeWidth: 2
          }}
        />
      </RechartsRadar>
    </ResponsiveContainer>
  );
}
