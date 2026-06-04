import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import { apiAuthDelete } from '../hooks/useAuth';
import '../styles/media.css';

export default function Media() {
  const { authState, isAdmin, authHeader } = useAuth();
  const { data: news, loading, error, refetch } = useFetch('/news');

  const handleDelete = async (id) => {
    if (!window.confirm('Bu haberi kalıcı olarak silmek istediğinize emin misiniz?')) return;
    try {
      await apiAuthDelete(`/admin/news/${id}`, authHeader());
      refetch();
    } catch (err) {
      alert('Haber silinemedi: ' + err.message);
    }
  };

  if (loading) return <div className="media-page__loading">Haberler yükleniyor...</div>;
  if (error) return <div className="media-page__loading">Haberler yüklenirken hata oluştu.</div>;

  return (
    <div className="media-page animate-fade-in">
      <div className="media-page__header glass-card">
        <h1>📰 MFL Medya</h1>
        <p>Halı saha dünyasından en son haberler, skandallar ve duyurular.</p>
      </div>

      <div className="media-page__grid">
        {(news || []).map(item => (
          <div key={item._id} className={`news-card glass-card ${item.type === 'scandal' ? 'news-card--scandal' : ''}`}>
            {item.targetPlayer && (
              <div className="news-card__image-wrapper">
                <img 
                  src={`/players/${item.targetPlayer.photo || 'default.png'}`} 
                  alt={item.targetPlayer.name}
                  className={item.type === 'scandal' ? 'scandal-filter' : ''}
                  onError={(e) => { e.target.src = '/players/default.png'; }}
                />
                {item.type === 'scandal' && (
                  <div className="news-card__scandal-stamp">SKANDAL</div>
                )}
              </div>
            )}
            
            <div className="news-card__content">
              <div className="news-card__meta">
                <span className="news-card__date">
                  {new Date(item.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                </span>
                {item.type === 'scandal' && (
                  <span className="news-card__badge news-card__badge--danger">Piyasa Düşüşü: {item.impactPercent}%</span>
                )}
              </div>
              <h3 className="news-card__headline">{item.headline}</h3>
              <p className="news-card__text">{item.content}</p>
              
              {isAdmin() && (
                <button 
                  onClick={() => handleDelete(item._id)}
                  style={{
                    marginTop: '15px',
                    padding: '8px',
                    backgroundColor: 'rgba(255, 82, 82, 0.1)',
                    color: 'var(--accent-red)',
                    border: '1px solid var(--accent-red)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  🗑️ Haberi Kaldır
                </button>
              )}
            </div>
          </div>
        ))}
        {(!news || news.length === 0) && (
          <div className="media-page__empty">Şu an için yeni bir haber bulunmuyor.</div>
        )}
      </div>
    </div>
  );
}
