import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import { apiAuthDelete } from '../hooks/useAuth';
import MatchCard from '../components/fixtures/MatchCard';
import '../styles/fixtures.css';

const FORMATS = ['Tümü', '6v6', '7v7', '8v8'];

export default function Fixtures() {
  const navigate = useNavigate();
  const { isAdmin, authHeader } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [formatFilter, setFormatFilter] = useState('Tümü');

  const { data: matches, loading, error, refetch } = useFetch('/matches');

  const filtered = (matches || []).filter(m => {
    const isPast = new Date(m.date) < new Date();
    
    // Yaklaşan: Statüsü upcoming ve tarihi geçmemiş
    // Geçmiş: Statüsü completed VEYA tarihi geçmiş
    const statusMatch = activeTab === 'upcoming' 
      ? (m.status === 'upcoming' && !isPast)
      : (m.status === 'completed' || isPast);
      
    const formatMatch = formatFilter === 'Tümü' || m.format === formatFilter;
    return statusMatch && formatMatch;
  });

  const handleDelete = async (matchId) => {
    if (!window.confirm('Bu maçı silmek istediğinizden emin misiniz?')) return;
    try {
      await apiAuthDelete(`/admin/match/${matchId}`, authHeader());
      refetch();
    } catch (e) {
      alert('Silme hatası: ' + e.message);
    }
  };

  return (
    <div className="fixtures">
      <div className="fixtures__header animate-fade-in">
        <h1>📅 Fikstür & Tarihçe</h1>
        <p>Geçmiş maçlar, yaklaşan karşılaşmalar</p>
      </div>

      {/* Sekmeler + Format filtresi */}
      <div className="fixtures__controls glass-card animate-fade-in animate-fade-in-delay-1">
        <div className="fixtures__tabs">
          <button
            className={`fixtures__tab ${activeTab === 'upcoming' ? 'fixtures__tab--active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            ⏳ Yaklaşan
          </button>
          <button
            className={`fixtures__tab ${activeTab === 'completed' ? 'fixtures__tab--active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            ✅ Geçmiş
          </button>
        </div>

        <div className="fixtures__format-filter">
          {FORMATS.map(f => (
            <button
              key={f}
              className={`fixtures__filter-btn ${formatFilter === f ? 'fixtures__filter-btn--active' : ''}`}
              onClick={() => setFormatFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Maç listesi */}
      <div className="fixtures__list animate-fade-in animate-fade-in-delay-2">
        {loading && (
          <div className="fixtures__empty">
            <span>⚽</span> Maçlar yükleniyor...
          </div>
        )}
        {error && (
          <div className="fixtures__empty">
            <span>❌</span> {error}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="fixtures__empty">
            <span>{activeTab === 'upcoming' ? '📭' : '🗃️'}</span>
            {activeTab === 'upcoming'
              ? 'Planlanmış maç yok. Admin panelinden ekleyebilirsiniz.'
              : 'Henüz tamamlanmış maç yok.'}
          </div>
        )}
        {filtered.map((match, i) => (
          <div
            key={match._id}
            className="animate-fade-in"
            style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
          >
            <MatchCard
              match={match}
              onClick={(m) => navigate(`/fixture/${m._id}`)}
              onDelete={handleDelete}
              isAdmin={isAdmin()}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
