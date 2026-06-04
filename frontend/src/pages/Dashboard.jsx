import { useFetch } from '../hooks/useFetch';
import CountdownTimer from '../components/dashboard/CountdownTimer';
import MarketSummary from '../components/dashboard/MarketSummary';
import MvpCard from '../components/dashboard/MvpCard';
import NewsSection from '../components/dashboard/NewsSection';
import '../styles/dashboard.css';

export default function Dashboard() {
  const { data: nextMatchData } = useFetch('/matches/next');
  const { data: marketData } = useFetch('/players/market/movers');
  const { data: matches } = useFetch('/matches');

  const nextMatch = nextMatchData?.nextMatch;
  const lastCompletedMatch = matches?.find(m => m.status === 'completed');

  return (
    <div className="dashboard">
      <div className="dashboard__title animate-fade-in">
        <h1>⚽ RB-MFL Tesisleri</h1>
        <p>Halı Saha Borsa & Futbol Yönetim Sistemi</p>
      </div>

      {/* Geri Sayım */}
      <div className="countdown-section animate-fade-in animate-fade-in-delay-1">
        <CountdownTimer targetDate={nextMatch?.date} />
      </div>

      {/* Ana Grid: Borsa + MVP + Son Maç */}
      <div className="dashboard__grid">
        <div className="animate-fade-in animate-fade-in-delay-2">
          <MarketSummary
            risers={marketData?.risers || []}
            fallers={marketData?.fallers || []}
          />
        </div>

        <div className="animate-fade-in animate-fade-in-delay-3">
          <MvpCard match={lastCompletedMatch} />
        </div>

        <div className="animate-fade-in animate-fade-in-delay-4">
          {lastCompletedMatch ? (
            <div className="last-match glass-card">
              <h3 className="last-match__title">⚽ Son Maç</h3>
              <div className="last-match__score">
                <div className="last-match__team">
                  <div className="last-match__team-name">
                    {lastCompletedMatch.teamA.name}
                  </div>
                  <div className="last-match__team-score">
                    {lastCompletedMatch.teamA.score}
                  </div>
                </div>
                <span className="last-match__vs">VS</span>
                <div className="last-match__team">
                  <div className="last-match__team-name">
                    {lastCompletedMatch.teamB.name}
                  </div>
                  <div className="last-match__team-score">
                    {lastCompletedMatch.teamB.score}
                  </div>
                </div>
              </div>
              <div className="last-match__date">
                {new Date(lastCompletedMatch.date).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
          ) : (
            <div className="last-match glass-card">
              <h3 className="last-match__title">⚽ Son Maç</h3>
              <div className="last-match__empty">
                Henüz tamamlanmış maç yok.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Son Haberler */}
      <NewsSection />
    </div>
  );
}
