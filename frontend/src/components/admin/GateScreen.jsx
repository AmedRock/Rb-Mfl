import { useState } from 'react';

export default function GateScreen({ onAdminLogin, onPlayerLogin }) {
  const [mode, setMode] = useState('choose'); // 'choose' | 'admin' | 'player-login' | 'player-register'
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [playerPass, setPlayerPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shake, setShake] = useState(false);

  // Kayıt formu
  const [regForm, setRegForm] = useState({
    name: '', nickname: '', number: '', position: 'CM', motto: ''
  });

  const doShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  // Admin giriş
  const handleAdminLogin = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok && data.token) { onAdminLogin(data.token); }
      else { setError(data.message || 'Yanlış şifre'); doShake(); }
    } catch { setError('Sunucuya ulaşılamıyor'); }
    finally { setLoading(false); }
  };

  // Oyuncu giriş
  const handlePlayerLogin = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: playerPass })
      });
      const data = await res.json();
      if (res.ok && data.token) { onPlayerLogin(data.token, data.player); }
      else { setError(data.message || 'Giriş başarısız'); doShake(); }
    } catch { setError('Sunucuya ulaşılamıyor'); }
    finally { setLoading(false); }
  };

  // Oyuncu kayıt
  const handleRegister = async (e) => {
    e.preventDefault(); setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, password: playerPass,
          name: regForm.name, nickname: regForm.nickname,
          number: Number(regForm.number), position: regForm.position,
          motto: regForm.motto
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        setTimeout(() => { setMode('player-login'); setSuccess(''); }, 2000);
      } else { setError(data.message); doShake(); }
    } catch { setError('Sunucuya ulaşılamıyor'); }
    finally { setLoading(false); }
  };

  const POSITIONS = ['GK','CB','LB','RB','CDM','CM','CAM','LM','RM','LW','RW','ST','CF'];

  // ─── Seçim ekranı ───
  if (mode === 'choose') return (
    <div className="admin-login">
      <div className="gate-screen glass-card animate-fade-in">
        <div className="admin-login__lock">🏟️</div>
        <h1 className="admin-login__title">RB-MFL Giriş</h1>
        <p className="admin-login__subtitle">Nasıl devam etmek istersiniz?</p>
        <div className="gate-buttons">
          <button className="gate-btn gate-btn--admin" onClick={() => { setMode('admin'); setError(''); }}>
            🔐 Admin Girişi
          </button>
          <button className="gate-btn gate-btn--player" onClick={() => { setMode('player-login'); setError(''); }}>
            ⚽ Oyuncu Girişi
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Admin giriş ───
  if (mode === 'admin') return (
    <div className="admin-login">
      <div className={`admin-login__card glass-card ${shake ? 'admin-login__card--shake' : ''}`}>
        <button className="gate-back" onClick={() => setMode('choose')}>← Geri</button>
        <div className="admin-login__lock">🔐</div>
        <h1 className="admin-login__title">Sır Odası</h1>
        <p className="admin-login__subtitle">Bu alan yetkili personele özeldir.</p>
        <form onSubmit={handleAdminLogin} className="admin-login__form">
          <input className={`admin-login__input ${error ? 'admin-login__input--error' : ''}`}
            type="password" placeholder="Şifre" value={password}
            onChange={e => setPassword(e.target.value)} autoFocus />
          {error && <p className="admin-login__error">❌ {error}</p>}
          <button type="submit" className="admin-login__btn" disabled={loading || !password}>
            {loading ? '⏳ Doğrulanıyor...' : 'İçeri Gir →'}
          </button>
        </form>
      </div>
    </div>
  );

  // ─── Oyuncu giriş ───
  if (mode === 'player-login') return (
    <div className="admin-login">
      <div className={`admin-login__card glass-card ${shake ? 'admin-login__card--shake' : ''}`}>
        <button className="gate-back" onClick={() => setMode('choose')}>← Geri</button>
        <div className="admin-login__lock">⚽</div>
        <h1 className="admin-login__title">Oyuncu Girişi</h1>
        <p className="admin-login__subtitle">Hesabınla giriş yap</p>
        <form onSubmit={handlePlayerLogin} className="admin-login__form">
          <input className="admin-login__input" style={{ letterSpacing: 'normal' }}
            type="email" placeholder="E-posta" value={email}
            onChange={e => setEmail(e.target.value)} autoFocus />
          <input className={`admin-login__input ${error ? 'admin-login__input--error' : ''}`}
            type="password" placeholder="Şifre" value={playerPass}
            onChange={e => setPlayerPass(e.target.value)} />
          {error && <p className="admin-login__error">❌ {error}</p>}
          <button type="submit" className="admin-login__btn admin-login__btn--player"
            disabled={loading || !email || !playerPass}>
            {loading ? '⏳ Giriş yapılıyor...' : 'Giriş Yap →'}
          </button>
        </form>
        <div className="gate-switch">
          Hesabın yok mu?{' '}
          <button onClick={() => { setMode('player-register'); setError(''); }}>Hesap Aç</button>
        </div>
      </div>
    </div>
  );

  // ─── Oyuncu kayıt ───
  return (
    <div className="admin-login">
      <div className={`gate-register glass-card ${shake ? 'admin-login__card--shake' : ''}`}>
        <button className="gate-back" onClick={() => setMode('player-login')}>← Geri</button>
        <div className="admin-login__lock">📝</div>
        <h1 className="admin-login__title">Hesap Aç</h1>
        <p className="admin-login__subtitle">Bilgilerini doldur, admin onayından sonra giriş yapabilirsin.</p>
        {success && <p className="admin-msg admin-msg--success">{success}</p>}
        <form onSubmit={handleRegister} className="admin-login__form" style={{ gap: '10px' }}>
          <div className="admin-form__row">
            <input className="admin-login__input" style={{ letterSpacing: 'normal', flex: 1 }}
              placeholder="Ad Soyad *" required value={regForm.name}
              onChange={e => setRegForm({...regForm, name: e.target.value})} />
            <input className="admin-login__input" style={{ letterSpacing: 'normal', flex: 1 }}
              placeholder="Lakap" value={regForm.nickname}
              onChange={e => setRegForm({...regForm, nickname: e.target.value})} />
          </div>
          <div className="admin-form__row">
            <input className="admin-login__input" style={{ letterSpacing: 'normal', flex: 1 }}
              type="number" placeholder="Forma No *" required min="1" max="99"
              value={regForm.number}
              onChange={e => setRegForm({...regForm, number: e.target.value})} />
            <select className="admin-login__input" style={{ letterSpacing: 'normal', flex: 1 }}
              value={regForm.position}
              onChange={e => setRegForm({...regForm, position: e.target.value})}>
              {POSITIONS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <input className="admin-login__input" style={{ letterSpacing: 'normal' }}
            placeholder="Motto (isteğe bağlı)" value={regForm.motto}
            onChange={e => setRegForm({...regForm, motto: e.target.value})} />
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '4px 0' }} />
          <input className="admin-login__input" style={{ letterSpacing: 'normal' }}
            type="email" placeholder="E-posta *" required value={email}
            onChange={e => setEmail(e.target.value)} />
          <input className="admin-login__input" style={{ letterSpacing: 'normal' }}
            type="password" placeholder="Şifre *" required value={playerPass}
            onChange={e => setPlayerPass(e.target.value)} />
          {error && <p className="admin-login__error">❌ {error}</p>}
          <button type="submit" className="admin-login__btn admin-login__btn--player"
            disabled={loading || !email || !playerPass || !regForm.name || !regForm.number}>
            {loading ? '⏳ Gönderiliyor...' : '📩 Başvuruyu Gönder'}
          </button>
        </form>
        <div className="gate-switch">
          Zaten hesabın var mı?{' '}
          <button onClick={() => { setMode('player-login'); setError(''); }}>Giriş Yap</button>
        </div>
      </div>
    </div>
  );
}
