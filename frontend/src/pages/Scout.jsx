import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import FifaCard from '../components/cards/FifaCard';
import '../styles/scout.css';

const POSITIONS = ['Tümü', 'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF'];

const SORT_OPTIONS = [
  { value: 'overall',   label: '⭐ OVR (Yüksek → Düşük)' },
  { value: 'pace',      label: '💨 Hız (Yüksek → Düşük)' },
  { value: 'shooting',  label: '🎯 Şut (Yüksek → Düşük)' },
  { value: 'passing',   label: '🔄 Pas (Yüksek → Düşük)' },
  { value: 'dribbling', label: '🕹️ Dribling (Yüksek → Düşük)' },
  { value: 'defending', label: '🛡️ Defans (Yüksek → Düşük)' },
  { value: 'physical',  label: '💪 Fiziksel (Yüksek → Düşük)' },
  { value: 'marketValue', label: '💰 Piyasa Değeri (Yüksek → Düşük)' },
  { value: 'name',      label: '🔤 İsim (A → Z)' },
];

const STAT_FILTERS = [
  { key: 'Ovr',       label: 'OVR',      emoji: '⭐' },
  { key: 'Pace',      label: 'Hız',      emoji: '💨' },
  { key: 'Shooting',  label: 'Şut',      emoji: '🎯' },
  { key: 'Passing',   label: 'Pas',      emoji: '🔄' },
  { key: 'Dribbling', label: 'Dribling', emoji: '🕹️' },
  { key: 'Defending', label: 'Defans',   emoji: '🛡️' },
  { key: 'Physical',  label: 'Fiziksel', emoji: '💪' },
];

const DEFAULT_RANGES = Object.fromEntries(
  STAT_FILTERS.flatMap(s => [
    [`min${s.key}`, 0],
    [`max${s.key}`, 99],
  ])
);

function StatRangeSlider({ stat, ranges, onChange }) {
  const minKey = `min${stat.key}`;
  const maxKey = `max${stat.key}`;
  const minVal = ranges[minKey];
  const maxVal = ranges[maxKey];

  const isActive = minVal > 0 || maxVal < 99;

  return (
    <div className={`scout__stat-filter ${isActive ? 'scout__stat-filter--active' : ''}`}>
      <div className="scout__stat-filter__header">
        <span className="scout__stat-filter__emoji">{stat.emoji}</span>
        <span className="scout__stat-filter__label">{stat.label}</span>
        <span className="scout__stat-filter__range">
          <span className="scout__stat-filter__val">{minVal}</span>
          –
          <span className="scout__stat-filter__val">{maxVal}</span>
        </span>
        {isActive && (
          <button
            className="scout__stat-filter__reset"
            onClick={() => onChange({ [minKey]: 0, [maxKey]: 99 })}
            title="Sıfırla"
          >×</button>
        )}
      </div>

      {/* Çift slider: min ve max birbirini geçemesin */}
      <div className="scout__range-track">
        <div
          className="scout__range-fill"
          style={{
            left: `${(minVal / 99) * 100}%`,
            width: `${((maxVal - minVal) / 99) * 100}%`,
          }}
        />
        <input
          type="range" min={0} max={99} step={1}
          value={minVal}
          onChange={e => {
            const v = Math.min(Number(e.target.value), maxVal - 1);
            onChange({ [minKey]: v });
          }}
          className="scout__range-input scout__range-input--min"
        />
        <input
          type="range" min={0} max={99} step={1}
          value={maxVal}
          onChange={e => {
            const v = Math.max(Number(e.target.value), minVal + 1);
            onChange({ [maxKey]: v });
          }}
          className="scout__range-input scout__range-input--max"
        />
      </div>
    </div>
  );
}

export default function Scout() {
  const [search, setSearch]     = useState('');
  const [position, setPosition] = useState('Tümü');
  const [sort, setSort]         = useState('overall');
  const [ranges, setRanges]     = useState(DEFAULT_RANGES);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const navigate = useNavigate();

  const handleRangeChange = (patch) => setRanges(prev => ({ ...prev, ...patch }));

  const resetAll = () => {
    setSearch(''); setPosition('Tümü'); setSort('overall');
    setRanges(DEFAULT_RANGES);
  };

  // Aktif filtre sayısı (rozet için)
  const activeStatCount = STAT_FILTERS.filter(
    s => ranges[`min${s.key}`] > 0 || ranges[`max${s.key}`] < 99
  ).length;

  // URL params
  const queryParams = new URLSearchParams();
  if (position !== 'Tümü') queryParams.set('position', position);
  if (sort)   queryParams.set('sort', sort);
  if (search) queryParams.set('search', search);
  STAT_FILTERS.forEach(s => {
    const minVal = ranges[`min${s.key}`];
    const maxVal = ranges[`max${s.key}`];
    if (minVal > 0)  queryParams.set(`min${s.key}`, minVal);
    if (maxVal < 99) queryParams.set(`max${s.key}`, maxVal);
  });

  const { data: players, loading, error } = useFetch(`/players?${queryParams.toString()}`);

  return (
    <div className="scout">
      <div className="scout__header animate-fade-in">
        <h1>🔍 Scout Ekranı</h1>
        <p>Oyuncu Borsası &amp; Kadro Değerlendirme</p>
      </div>

      {/* ── Ana filtre barı ── */}
      <div className="scout__filters glass-card animate-fade-in animate-fade-in-delay-1">
        <input
          className="scout__search"
          type="text"
          placeholder="Oyuncu ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="scout__select"
          value={position}
          onChange={e => setPosition(e.target.value)}
        >
          {POSITIONS.map(pos => (
            <option key={pos} value={pos}>{pos === 'Tümü' ? '📌 Tüm Pozisyonlar' : pos}</option>
          ))}
        </select>
        <select
          className="scout__select"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Stat kıyas butonu */}
        <button
          className={`scout__stat-toggle ${filtersOpen ? 'scout__stat-toggle--open' : ''}`}
          onClick={() => setFiltersOpen(v => !v)}
        >
          🎚️ Stat Kıyası
          {activeStatCount > 0 && (
            <span className="scout__stat-badge">{activeStatCount}</span>
          )}
        </button>

        {(activeStatCount > 0 || search || position !== 'Tümü') && (
          <button className="scout__reset-btn" onClick={resetAll}>
            ↺ Sıfırla
          </button>
        )}
      </div>

      {/* ── Stat aralık filtreleri (açılır panel) ── */}
      {filtersOpen && (
        <div className="scout__stat-panel glass-card animate-fade-in">
          <p className="scout__stat-panel__hint">
            Her stat için minimum ve maksimum değer aralığı belirleyebilirsin.
          </p>
          <div className="scout__stat-grid">
            {STAT_FILTERS.map(stat => (
              <StatRangeSlider
                key={stat.key}
                stat={stat}
                ranges={ranges}
                onChange={handleRangeChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* Oyuncu sayısı */}
      {players && (
        <div className="scout__count animate-fade-in animate-fade-in-delay-2">
          Toplam <span>{players.length}</span> oyuncu bulundu
        </div>
      )}

      {/* Oyuncu Grid */}
      <div className="scout__grid">
        {loading && (
          <div className="scout__loading">Oyuncular yükleniyor...</div>
        )}
        {error && (
          <div className="scout__empty">
            <span>❌</span>Hata: {error}
          </div>
        )}
        {!loading && !error && players?.length === 0 && (
          <div className="scout__empty">
            <span>🔍</span>
            Oyuncu bulunamadı. Filtreleri değiştirmeyi deneyin.
          </div>
        )}
        {players?.map((player, index) => (
          <div
            key={player._id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
          >
            <FifaCard
              player={player}
              onClick={p => navigate(`/player/${p._id}`)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
