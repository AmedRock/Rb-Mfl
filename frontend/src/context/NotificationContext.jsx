import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [news, setNews] = useState([]);
  const [activeToast, setActiveToast] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        const data = await response.json();
        
        if (data && data.length > 0) {
          setNews(data);
          
          // Check for new items
          const latestNews = data[0];
          const lastSeenId = localStorage.getItem('mfl_last_news_id');
          
          if (lastSeenId !== latestNews._id) {
            // It's a new news item! Show toast
            setActiveToast(latestNews);
            localStorage.setItem('mfl_last_news_id', latestNews._id);
            
            // Auto hide toast after 10 seconds
            setTimeout(() => {
              setActiveToast(null);
            }, 10000);
          }
        }
      } catch (err) {
        console.error('Haberler çekilemedi', err);
      }
    };

    // Initial fetch
    fetchNews();

    // Poll every 30 seconds
    const interval = setInterval(fetchNews, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ news }}>
      {children}
      {activeToast && <NewsToast news={activeToast} onClose={() => setActiveToast(null)} />}
    </NotificationContext.Provider>
  );
}

function NewsToast({ news, onClose }) {
  return (
    <div className="news-toast animate-slide-in-right" onClick={() => {
      window.location.href = '/media';
      onClose();
    }}>
      <div className="news-toast__icon">
        {news.type === 'scandal' ? '📸' : '📰'}
      </div>
      <div className="news-toast__content">
        <h4>{news.type === 'scandal' ? 'SON DAKİKA: SKANDAL!' : 'SON DAKİKA'}</h4>
        <p>{news.headline}</p>
      </div>
      <button className="news-toast__close" onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}>×</button>
    </div>
  );
}

export const useNotifications = () => useContext(NotificationContext);
