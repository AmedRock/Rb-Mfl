import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import FifaCard from '../components/cards/FifaCard';
import '../styles/scout.css';

const POSITIONS = ['Tümü', 'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF'];
const SORT_OPTIONS = [
  { value: 'overall', label: 'OVR (Yüksek → Düşük)' },
  { value: 'pace', label: 'Hız (Yüksek → Düşük)' },
  { value: 'shooting', label: 'Şut (Yüksek → Düşük)' },
  { value: 'marketValue', label: 'Piyasa Değeri (Yüksek → Düşük)' },
  { value: 'name', label: 'İsim (A → Z)' }
];

export default function Scout() {
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState('Tümü');
  const [sort, setSort] = useState('overall');
  const navigate = useNavigate();

  const queryParams = new URLSearchParams();
  if (position !== 'Tümü') queryParams.set('position', position);
  if (sort) queryParams.set('sort', sort);
  if (search) queryParams.set('search', search);

  const { data: players, loading, error } = useFetch(`/players?${queryParams.toString()}`);

  return (
    <div className="scout">
      <div className="scout__header animate-fade-in">
        <h1>🔍 Scout Ekranı</h1>
        <p>Oyuncu Borsası & Kadro Değerlendirme</p>
      </div>

      {/* Filtreler */}
      <div className="scout__filters glass-card animate-fade-in animate-fade-in-delay-1">
        <input
          className="scout__search"
          type="text"
          placeholder="Oyuncu ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="scout__select"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        >
          {POSITIONS.map(pos => (
            <option key={pos} value={pos}>{pos === 'Tümü' ? '📌 Tüm Pozisyonlar' : pos}</option>
          ))}
        </select>
        <select
          className="scout__select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

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
            <span>❌</span>
            Hata: {error}
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
              onClick={(p) => navigate(`/player/${p._id}`)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
