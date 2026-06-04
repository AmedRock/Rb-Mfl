import '../../styles/careerTimeline.css';

export default function CareerTimeline({ history }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="career-timeline">
      {history.map((item, index) => {
        const isScandal = item.reason && item.reason.includes('SKANDAL');
        return (
          <div key={index} className={`timeline-item ${isScandal ? 'timeline-item--scandal' : ''}`}>
            <div className="timeline-item__dot">
              {isScandal ? '🚨' : '📉'}
            </div>
            <div className="timeline-item__content glass-card">
              <span className="timeline-item__date">
                {new Date(item.date).toLocaleDateString('tr-TR', {
                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </span>
              <h4 className="timeline-item__reason">{item.reason}</h4>
              <div className="timeline-item__value">Yeni Piyasa Değeri: <strong>{item.value}M €</strong></div>
            </div>
          </div>
        );
      }).reverse()}
    </div>
  );
}
