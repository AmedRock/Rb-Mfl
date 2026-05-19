import { useState } from 'react';
import { apiAuthPost } from '../../hooks/useAuth';

const FORMATS = ['6v6', '7v7', '8v8'];

export default function AddMatchTab({ authHeader }) {
  const [form, setForm] = useState({
    date: '',
    format: '7v7',
    teamAName: 'Takım A',
    teamBName: 'Takım B',
  });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    try {
      await apiAuthPost('/matches', {
        date: new Date(form.date),
        format: form.format,
        status: 'upcoming',
        teamA: { name: form.teamAName },
        teamB: { name: form.teamBName }
      }, authHeader);
      setStatus('success');
      setForm({ date: '', format: '7v7', teamAName: 'Takım A', teamBName: 'Takım B' });
    } catch (err) {
      setStatus('error:' + err.message);
    }
  };

  return (
    <div className="admin-tab">
      <h2 className="admin-tab__title">📅 Maç Ekle</h2>
      <p className="admin-tab__desc">Takvime yeni bir karşılaşma ekleyin.</p>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form__group">
          <label>Maç Tarihi & Saati</label>
          <input
            type="datetime-local"
            value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })}
            required
          />
        </div>

        <div className="admin-form__group">
          <label>Format</label>
          <div className="admin-btn-group">
            {FORMATS.map(f => (
              <button
                key={f}
                type="button"
                className={`admin-btn-option ${form.format === f ? 'admin-btn-option--active' : ''}`}
                onClick={() => setForm({ ...form, format: f })}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-form__row">
          <div className="admin-form__group">
            <label>Takım A Adı</label>
            <input
              type="text"
              value={form.teamAName}
              onChange={e => setForm({ ...form, teamAName: e.target.value })}
            />
          </div>
          <div className="admin-form__group">
            <label>Takım B Adı</label>
            <input
              type="text"
              value={form.teamBName}
              onChange={e => setForm({ ...form, teamBName: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="admin-submit-btn">
          ➕ Maç Ekle
        </button>

        {status === 'success' && <p className="admin-msg admin-msg--success">✅ Maç takvime eklendi!</p>}
        {status.startsWith('error') && <p className="admin-msg admin-msg--error">❌ {status.replace('error:', '')}</p>}
      </form>
    </div>
  );
}
