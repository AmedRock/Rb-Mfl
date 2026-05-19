import { useState, useEffect } from 'react';

export default function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    if (!targetDate) return null;
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return null;
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60)
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <div className="countdown__no-match">
        <span>⏳</span>
        Planlanmış maç yok. Admin panelinden maç ekleyin.
      </div>
    );
  }

  const units = [
    { value: timeLeft.days, label: 'Gün' },
    { value: timeLeft.hours, label: 'Saat' },
    { value: timeLeft.minutes, label: 'Dakika' },
    { value: timeLeft.seconds, label: 'Saniye' }
  ];

  return (
    <div className="countdown">
      {units.map((unit, index) => (
        <div key={unit.label} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <div className="countdown__unit glass-card">
            <div className="countdown__number">
              {String(unit.value).padStart(2, '0')}
            </div>
            <div className="countdown__label">{unit.label}</div>
          </div>
          {index < units.length - 1 && (
            <span className="countdown__separator">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
