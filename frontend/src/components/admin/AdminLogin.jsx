import { useState } from 'react';

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        onLogin(data.token);
      } else {
        setError(data.message || 'Yanlış şifre');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setError('Sunucuya ulaşılamıyor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className={`admin-login__card glass-card ${shake ? 'admin-login__card--shake' : ''}`}>
        <div className="admin-login__lock">🔐</div>
        <h1 className="admin-login__title">Sır Odası</h1>
        <p className="admin-login__subtitle">Bu alan yetkili personele özeldir.</p>

        <form onSubmit={handleSubmit} className="admin-login__form">
          <input
            className={`admin-login__input ${error ? 'admin-login__input--error' : ''}`}
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
          />
          {error && (
            <p className="admin-login__error">❌ {error}</p>
          )}
          <button
            type="submit"
            className="admin-login__btn"
            disabled={loading || !password}
          >
            {loading ? '⏳ Doğrulanıyor...' : 'İçeri Gir →'}
          </button>
        </form>
      </div>
    </div>
  );
}
