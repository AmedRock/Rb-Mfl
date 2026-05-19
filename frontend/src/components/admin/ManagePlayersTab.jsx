import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { apiAuthPost, apiAuthPut } from '../../hooks/useAuth';

const POSITIONS = ['GK','CB','LB','RB','CDM','CM','CAM','LM','RM','LW','RW','ST','CF'];
const STAT_KEYS = ['pace','shooting','passing','dribbling','defending','physical'];
const STAT_LABELS = { pace:'Hız', shooting:'Şut', passing:'Pas', dribbling:'Dribling', defending:'Defans', physical:'Fiziksel' };
const EMPTY = { name:'', nickname:'', number:'', photo:'default.png', position:'CM', tags:'', motto:'', marketValue:50, stats:{ pace:65, shooting:65, passing:65, dribbling:65, defending:65, physical:65 } };

export default function ManagePlayersTab({ authHeader }) {
  const { data: players, refetch } = useFetch('/players');
  const [mode, setMode] = useState('list');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('');
  
  // Fotoğraf yükleme için state'ler
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const openAdd = () => { 
    setForm(EMPTY); 
    setEditing(null); 
    setMode('add'); 
    setStatus(''); 
    setPhotoFile(null); 
    setPreviewUrl(null); 
  };
  
  const openEdit = (p) => {
    setEditing(p._id);
    setForm({ 
      name: p.name, 
      nickname: p.nickname || '', 
      number: p.number, 
      photo: p.photo || 'default.png', 
      position: p.position, 
      tags: (p.tags || []).join(', '), 
      motto: p.motto || '', 
      marketValue: p.marketValue || 50, 
      stats: { ...p.stats } 
    });
    setMode('edit'); 
    setStatus('');
    setPhotoFile(null);
    setPreviewUrl(p.photo ? `/players/${p.photo}` : null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleStat = (key, val) => setForm(f => ({ ...f, stats:{ ...f.stats, [key]: Math.min(99, Math.max(1, Number(val))) } }));

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setStatus('Yükleniyor...');
    
    let uploadedFilename = form.photo;

    try {
      // 1. Eğer yeni bir fotoğraf seçildiyse önce onu yükle
      if (photoFile) {
        const formData = new FormData();
        formData.append('photo', photoFile);
        
        const headers = { ...authHeader };
        // FormData gönderilirken Content-Type tarayıcı tarafından otomatik belirlenmeli
        delete headers['Content-Type']; 

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: headers,
          body: formData
        });

        if (!res.ok) {
          throw new Error('Fotoğraf yüklenemedi');
        }

        const data = await res.json();
        uploadedFilename = data.filename;
      }

      // 2. Oyuncu verilerini kaydet
      const payload = { 
        ...form, 
        photo: uploadedFilename,
        number: Number(form.number), 
        marketValue: Number(form.marketValue), 
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) 
      };

      if (mode === 'add') { 
        await apiAuthPost('/players', payload, authHeader); 
        setStatus('success:Oyuncu eklendi!'); 
      } else { 
        await apiAuthPut(`/admin/player/${editing}/stats`, payload, authHeader); 
        setStatus('success:Oyuncu güncellendi!'); 
      }
      
      refetch(); 
      setTimeout(() => setMode('list'), 1000);
    } catch (err) { 
      setStatus('error:' + err.message); 
    }
  };

  if (mode !== 'list') return (
    <div className="admin-tab">
      <div className="admin-tab__back-row">
        <button className="admin-back-btn" onClick={() => setMode('list')}>← Geri</button>
        <h2 className="admin-tab__title">{mode === 'add' ? '➕ Yeni Oyuncu' : '✏️ Oyuncu Düzenle'}</h2>
      </div>
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form__row">
          <div className="admin-form__group"><label>Ad Soyad</label><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
          <div className="admin-form__group"><label>Lakap</label><input value={form.nickname} onChange={e=>setForm({...form,nickname:e.target.value})} /></div>
        </div>
        <div className="admin-form__row">
          <div className="admin-form__group"><label>Forma No</label><input type="number" min="1" max="99" required value={form.number} onChange={e=>setForm({...form,number:e.target.value})} /></div>
          <div className="admin-form__group"><label>Pozisyon</label><select value={form.position} onChange={e=>setForm({...form,position:e.target.value})}>{POSITIONS.map(p=><option key={p}>{p}</option>)}</select></div>
        </div>
        
        {/* Fotoğraf Seçimi */}
        <div className="admin-form__group">
          <label>Profil Fotoğrafı</label>
          <div className="admin-photo-upload">
            <label className="admin-photo-upload__btn">
              <span>📂 Cihazdan Seç</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                style={{ display: 'none' }}
              />
            </label>
            <div className="admin-photo-upload__info">
              <img 
                className="admin-photo-preview" 
                src={previewUrl || (form.photo ? `/players/${form.photo}` : '/players/default.png')} 
                alt="önizleme" 
                onError={e => { e.target.onerror = null; e.target.src = '/players/default.png'; }} 
              />
              <span className="admin-photo-upload__filename">
                {photoFile ? photoFile.name : (form.photo !== 'default.png' && form.photo ? form.photo : 'Dosya seçilmedi')}
              </span>
            </div>
          </div>
        </div>
        
        <div className="admin-form__group"><label>Etiketler (virgülle ayırın)</label><input placeholder="Forvet, Hızlı" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} /></div>
        <div className="admin-form__group"><label>Motto</label><textarea rows="2" value={form.motto} onChange={e=>setForm({...form,motto:e.target.value})} /></div>
        <div className="admin-form__group"><label>Piyasa Değeri (M)</label><input type="number" min="20" max="200" value={form.marketValue} onChange={e=>setForm({...form,marketValue:e.target.value})} /></div>
        
        <div className="admin-form__group">
          <label>⚽ FIFA Statları (1-99)</label>
          <div className="stat-editor">
            {STAT_KEYS.map(key => (
              <div key={key} className="stat-editor__row">
                <span className="stat-editor__label">{STAT_LABELS[key]}</span>
                <input type="range" min="1" max="99" value={form.stats[key]} onChange={e=>handleStat(key,e.target.value)} />
                <input type="number" min="1" max="99" className="stat-editor__num" value={form.stats[key]} onChange={e=>handleStat(key,e.target.value)} />
              </div>
            ))}
          </div>
        </div>
        
        <button type="submit" className="admin-submit-btn" disabled={status === 'Yükleniyor...'}>
          {status === 'Yükleniyor...' ? '⏳ Bekleyin...' : (mode==='add' ? '➕ Oyuncu Ekle' : '💾 Kaydet')}
        </button>
        
        {status.startsWith('success') && <p className="admin-msg admin-msg--success">✅ {status.replace('success:','')}</p>}
        {status.startsWith('error') && <p className="admin-msg admin-msg--error">❌ {status.replace('error:','')}</p>}
      </form>
    </div>
  );

  return (
    <div className="admin-tab">
      <div className="admin-tab__header-row">
        <h2 className="admin-tab__title">⚽ Oyuncu Yönetimi</h2>
        <button className="admin-submit-btn admin-submit-btn--sm" onClick={openAdd}>+ Yeni Oyuncu</button>
      </div>
      <div className="admin-player-list">
        {(players||[]).map(p => (
          <div key={p._id} className="admin-player-item glass-card">
            <img src={`/players/${p.photo||'default.png'}`} alt={p.name} onError={e=>{e.target.src='/players/default.png';}} />
            <div className="admin-player-item__info">
              <span className="admin-player-item__name">{p.name}</span>
              <span className="admin-player-item__meta">{p.position} · OVR {p.overall} · {p.marketValue}M</span>
            </div>
            <button className="admin-action-btn" onClick={()=>openEdit(p)}>✏️ Düzenle</button>
          </div>
        ))}
      </div>
    </div>
  );
}
