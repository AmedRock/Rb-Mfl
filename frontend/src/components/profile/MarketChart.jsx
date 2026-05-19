import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(13, 13, 26, 0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '10px 14px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}>
        <p style={{ color: '#FFD700', fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>
          {payload[0].value}M
        </p>
        <p style={{ color: '#8A8A9A', fontSize: '0.7rem', margin: '4px 0 0 0' }}>
          {label}
        </p>
        {payload[0].payload.reason && (
          <p style={{ color: '#aaa', fontSize: '0.65rem', margin: '2px 0 0 0', fontStyle: 'italic' }}>
            {payload[0].payload.reason}
          </p>
        )}
      </div>
    );
  }
  return null;
}

export default function MarketChart({ marketHistory = [] }) {
  if (marketHistory.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
        <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>📊</span>
        Henüz borsa verisi yok
      </div>
    );
  }

  const data = marketHistory.map((entry, index) => ({
    name: new Date(entry.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }),
    value: entry.value,
    reason: entry.reason
  }));

  // Trend rengi: son değer başlangıçtan yüksekse yeşil, düşükse kırmızı
  const firstValue = data[0]?.value || 0;
  const lastValue = data[data.length - 1]?.value || 0;
  const trendColor = lastValue >= firstValue ? '#00E676' : '#FF1744';

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <defs>
          <linearGradient id="marketGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={trendColor} stopOpacity={0.2} />
            <stop offset="95%" stopColor={trendColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.05)"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          tick={{ fill: '#8A8A9A', fontSize: 10 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#8A8A9A', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          domain={['dataMin - 5', 'dataMax + 5']}
          tickFormatter={(v) => `${v}M`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={trendColor}
          strokeWidth={2.5}
          fill="url(#marketGradient)"
          dot={{
            r: 4,
            fill: trendColor,
            strokeWidth: 0
          }}
          activeDot={{
            r: 6,
            fill: trendColor,
            stroke: '#fff',
            strokeWidth: 2
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
