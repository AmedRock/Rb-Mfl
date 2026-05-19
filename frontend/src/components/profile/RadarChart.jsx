import { Radar, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const STAT_LABELS = {
  pace: 'Hız',
  shooting: 'Şut',
  passing: 'Pas',
  dribbling: 'Dribling',
  defending: 'Defans',
  physical: 'Fiziksel'
};

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
        <Radar
          name="Statlar"
          dataKey="value"
          stroke="#FFD700"
          fill="#FFD700"
          fillOpacity={0.15}
          strokeWidth={2}
          dot={{
            r: 3,
            fill: '#FFD700',
            strokeWidth: 0
          }}
          activeDot={{
            r: 5,
            fill: '#FFD700',
            stroke: '#fff',
            strokeWidth: 1
          }}
        />
      </RechartsRadar>
    </ResponsiveContainer>
  );
}
