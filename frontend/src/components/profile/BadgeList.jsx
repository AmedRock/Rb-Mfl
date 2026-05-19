const BADGE_ICONS = {
  'Duvar': '🧱',
  'Görünmez Adam': '👻',
  'Hat-trick Kralı': '👑',
  'Motor': '🏃',
  'Asist Kralı': '🎯',
  'Demir Adam': '🦾',
  'Altın Eldiven': '🧤',
  'Sniper': '🎯',
  'Kaptan': '©️',
  'Yeni Yıldız': '⭐'
};

export default function BadgeList({ badges = [] }) {
  if (badges.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        Henüz rozet kazanılmadı. Maçlarda performans göstermeye devam!
      </div>
    );
  }

  return (
    <div className="badges-grid">
      {badges.map((badge, index) => (
        <div key={index} className="badge-item glass-card">
          <span className="badge-item__icon">
            {badge.icon || BADGE_ICONS[badge.name] || '🏅'}
          </span>
          <span className="badge-item__name">{badge.name}</span>
          <span className="badge-item__date">
            {badge.earnedAt
              ? new Date(badge.earnedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
              : ''}
          </span>
        </div>
      ))}
    </div>
  );
}
