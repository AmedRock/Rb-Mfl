import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import '../../styles/media.css';

export default function NewsSection() {
  const { data: news, loading } = useFetch('/news');

  if (loading || !news || news.length === 0) return null;

  // Sadece son 3 haberi göster
  const recentNews = news.slice(0, 3);

  return (
    <div className="dashboard-news animate-fade-in animate-fade-in-delay-4">
      <div className="dashboard-news__header">
        <h2>📰 Son Haberler & Olaylar</h2>
        <Link to="/media" className="dashboard-news__link">Tümünü Gör →</Link>
      </div>

      <div className="dashboard-news__grid">
        {recentNews.map(item => (
          <div key={item._id} className={`news-card glass-card ${item.type === 'scandal' ? 'news-card--scandal' : ''}`}>
            {item.targetPlayer && (
              <div className="news-card__image-wrapper" style={{ height: '150px' }}>
                <img 
                  src={`/players/${item.targetPlayer.photo || 'default.png'}`} 
                  alt={item.targetPlayer.name}
                  className={item.type === 'scandal' ? 'scandal-filter' : ''}
                  onError={(e) => { e.target.src = '/players/default.png'; }}
                />
                {item.type === 'scandal' && (
                  <div className="news-card__scandal-stamp" style={{ fontSize: '1.5rem', borderWidth: '3px' }}>SKANDAL</div>
                )}
              </div>
            )}
            
            <div className="news-card__content" style={{ padding: '15px' }}>
              <div className="news-card__meta">
                <span className="news-card__date">
                  {new Date(item.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                </span>
              </div>
              <h3 className="news-card__headline" style={{ fontSize: '1.1rem' }}>{item.headline}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
