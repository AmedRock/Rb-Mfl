import { useState, useMemo } from 'react';
import { useFetch, apiPost, apiPut } from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import { FORMATS, FORMATIONS, generateSlots, mirrorSlots } from '../utils/formations';
import { autoFillSlots, balanceTeams } from '../utils/teamBalancer';
import PitchField from '../components/tactics/PitchField';
import PlayerSelectModal from '../components/tactics/PlayerSelectModal';
import TeamPowerBar from '../components/tactics/TeamPowerBar';
import { FaMagic, FaBalanceScale, FaSave, FaTrashAlt } from 'react-icons/fa';
import '../styles/tactics.css';

export default function TacticsBoard() {
  const { isAdmin } = useAuth();
  
  // Maç ayarları
  const [format, setFormat] = useState('');
  const [formation, setFormation] = useState('');

  // Slot atamaları: { slotId: player }
  const [teamAAssignments, setTeamAAssignments] = useState({});
  const [teamBAssignments, setTeamBAssignments] = useState({});

  // Modal durumu
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Kaydetme durumu
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Oyuncuları ve maçları backend'den çek
  const { data: players } = useFetch('/players');
  const { data: matches } = useFetch('/matches');
  
  // Maç seçme modalı durumu
  const [matchSelectModalOpen, setMatchSelectModalOpen] = useState(false);
  const [modalError, setModalError] = useState('');

  // Slotları hesapla
  const teamASlots = useMemo(() => {
    if (!formation) return [];
    return generateSlots(formation);
  }, [formation]);

  const teamBSlots = useMemo(() => {
    return mirrorSlots(teamASlots);
  }, [teamASlots]);

  // Kullanılmış oyuncu ID'leri
  const usedPlayerIds = useMemo(() => {
    const ids = new Set();
    Object.values(teamAAssignments).forEach(p => p && ids.add(p._id));
    Object.values(teamBAssignments).forEach(p => p && ids.add(p._id));
    return ids;
  }, [teamAAssignments, teamBAssignments]);

  // Format değişince formasyonu sıfırla
  const handleFormatChange = (newFormat) => {
    setFormat(newFormat);
    setFormation('');
    setTeamAAssignments({});
    setTeamBAssignments({});
  };

  // Formasyon değişince atamaları sıfırla
  const handleFormationChange = (newFormation) => {
    setFormation(newFormation);
    setTeamAAssignments({});
    setTeamBAssignments({});
  };

  // Slot tıklama → Modal aç
  const handleSlotClick = (slot, team) => {
    setSelectedSlot(slot);
    setSelectedTeam(team);
    setModalOpen(true);
  };

  // Oyuncu seçimi
  const handlePlayerSelect = (player) => {
    if (selectedTeam === 'A') {
      setTeamAAssignments(prev => ({ ...prev, [selectedSlot.id]: player }));
    } else {
      setTeamBAssignments(prev => ({ ...prev, [selectedSlot.id]: player }));
    }
    setModalOpen(false);
    setSelectedSlot(null);
    setSelectedTeam(null);
  };

  // Oyuncu kaldır
  const handleRemove = (slotId, team) => {
    if (team === 'A') {
      setTeamAAssignments(prev => {
        const copy = { ...prev };
        delete copy[slotId];
        return copy;
      });
    } else {
      setTeamBAssignments(prev => {
        const copy = { ...prev };
        delete copy[slotId];
        return copy;
      });
    }
  };

  // Otomatik doldur — Snake Draft ile dengeli dağıtım
  const handleAutoFill = () => {
    if (!players || players.length === 0) return;
    const { teamA, teamB } = autoFillSlots(
      teamASlots, teamBSlots,
      players,
      teamAAssignments,
      teamBAssignments
    );
    setTeamAAssignments(teamA);
    setTeamBAssignments(teamB);
  };

  // Takımları eşitle
  const handleBalance = () => {
    const { teamA, teamB } = balanceTeams(
      teamASlots, teamBSlots,
      teamAAssignments, teamBAssignments
    );
    setTeamAAssignments(teamA);
    setTeamBAssignments(teamB);
  };

  // Sahayı temizle
  const handleClear = () => {
    setTeamAAssignments({});
    setTeamBAssignments({});
  };

  // Kadroyu kaydet - Admin kontrolü
  const handleSave = () => {
    if (!isAdmin()) {
      setSaveMessage('⚠️ Sadece yetkili kişiler (Admin) kadroyu maça bağlayabilir.');
      return;
    }
    setModalError('');
    setMatchSelectModalOpen(true);
  };

  const handleConfirmMatchSelect = async (match) => {
    setModalError(''); // Önceki hataları temizle
    
    if (match.format !== format) {
      setModalError(`⚠️ Uyarı: Seçtiğiniz maç ${match.format} formatında, ancak kurduğunuz kadro ${format} formatında. Lütfen ${format} formatında bir maç seçin.`);
      return;
    }

    const hasSquad = match.formation && Object.keys(match.squadAssignments || {}).length > 0;
    if (hasSquad) {
      if (!window.confirm('⚠️ Bu maçın halihazırda bir kadrosu var. Üzerine yazmak istediğinize emin misiniz?')) {
        return;
      }
    }

    setSaving(true);
    setSaveMessage('');
    setMatchSelectModalOpen(false);

    try {
      const teamAPlayerIds = Object.values(teamAAssignments).filter(Boolean).map(p => p._id);
      const teamBPlayerIds = Object.values(teamBAssignments).filter(Boolean).map(p => p._id);

      const squadAssignments = {};
      Object.entries(teamAAssignments).forEach(([slotId, p]) => { if (p) squadAssignments[slotId] = p._id; });
      Object.entries(teamBAssignments).forEach(([slotId, p]) => { if (p) squadAssignments[slotId] = p._id; });

      await apiPut(`/matches/${match._id}/squad`, {
        format: format,
        formation: formation,
        teamA: { players: teamAPlayerIds },
        teamB: { players: teamBPlayerIds },
        squadAssignments
      });
      setSaveMessage('✅ Kadro başarıyla maça bağlandı!');
    } catch (err) {
      setSaveMessage(`❌ Hata: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const teamAPlayers = Object.values(teamAAssignments).filter(Boolean);
  const teamBPlayers = Object.values(teamBAssignments).filter(Boolean);
  const hasPlayers = teamAPlayers.length > 0 || teamBPlayers.length > 0;

  return (
    <div className="tactics">
      <div className="tactics__header animate-fade-in">
        <h1>♟️ Taktik Tahtası</h1>
        <p>Akıllı Kadro Kurucu</p>
      </div>

      {/* Maç Ayarları Paneli */}
      <div className="tactics__settings glass-card animate-fade-in animate-fade-in-delay-1">
        {/* Format Seçici */}
        <div className="tactics__format">
          <label className="tactics__label">Kişi Sayısı</label>
          <div className="tactics__format-buttons">
            {FORMATS.map(f => (
              <button
                key={f.value}
                className={`tactics__format-btn ${format === f.value ? 'tactics__format-btn--active' : ''}`}
                onClick={() => handleFormatChange(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Formasyon Menüsü */}
        {format && (
          <div className="tactics__formation">
            <label className="tactics__label">Formasyon</label>
            <div className="tactics__formation-buttons">
              {FORMATIONS[format]?.map(f => (
                <button
                  key={f.value}
                  className={`tactics__formation-btn ${formation === f.value ? 'tactics__formation-btn--active' : ''}`}
                  onClick={() => handleFormationChange(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Saha */}
      {formation && (
        <>
          <div className="tactics__pitch-wrapper animate-fade-in animate-fade-in-delay-2">
            <PitchField
              teamASlots={teamASlots}
              teamBSlots={teamBSlots}
              teamAAssignments={teamAAssignments}
              teamBAssignments={teamBAssignments}
              onSlotClick={handleSlotClick}
              onRemove={handleRemove}
            />
          </div>

          {/* Güç Barı */}
          {hasPlayers && (
            <div className="animate-fade-in animate-fade-in-delay-3">
              <TeamPowerBar
                teamAPlayers={teamAPlayers}
                teamBPlayers={teamBPlayers}
                teamASlots={teamASlots}
                teamBSlots={teamBSlots}
                teamAAssignments={teamAAssignments}
                teamBAssignments={teamBAssignments}
              />
            </div>
          )}

          {/* Aksiyon Butonları */}
          <div className="tactics__actions animate-fade-in animate-fade-in-delay-3">
            <button
              className="tactics__action-btn tactics__action-btn--fill"
              onClick={handleAutoFill}
              disabled={!players || players.length === 0}
            >
              <FaMagic /> Otomatik Doldur
            </button>
            <button
              className="tactics__action-btn tactics__action-btn--balance"
              onClick={handleBalance}
              disabled={!hasPlayers}
            >
              <FaBalanceScale /> Takımları Eşitle
            </button>
            <button
              className="tactics__action-btn tactics__action-btn--save"
              onClick={handleSave}
              disabled={saving || !hasPlayers}
            >
              <FaSave /> {saving ? 'Kaydediliyor...' : 'Kadroyu Kaydet'}
            </button>
            <button
              className="tactics__action-btn tactics__action-btn--clear"
              onClick={handleClear}
              disabled={!hasPlayers}
            >
              <FaTrashAlt /> Temizle
            </button>
          </div>

          {saveMessage && (
            <div className="tactics__save-message animate-fade-in" style={{
              marginTop: '20px',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              background: saveMessage.includes('⚠️') || saveMessage.includes('❌') 
                ? 'rgba(255, 82, 82, 0.1)' 
                : 'rgba(0, 230, 118, 0.1)',
              border: '1px solid',
              borderColor: saveMessage.includes('⚠️') || saveMessage.includes('❌') 
                ? 'rgba(255, 82, 82, 0.3)' 
                : 'rgba(0, 230, 118, 0.3)',
              color: saveMessage.includes('⚠️') || saveMessage.includes('❌') 
                ? 'var(--accent-red)' 
                : 'var(--accent-green)',
              textAlign: 'center',
              fontWeight: '600'
            }}>
              {saveMessage}
            </div>
          )}
        </>
      )}

      {/* Formasyon seçilmedi mesajı */}
      {!formation && format && (
        <div className="tactics__placeholder animate-fade-in">
          <span>📐</span>
          <p>Bir formasyon seçin</p>
        </div>
      )}

      {!format && (
        <div className="tactics__placeholder animate-fade-in animate-fade-in-delay-1">
          <span>⚽</span>
          <p>Başlamak için kişi sayısını seçin</p>
        </div>
      )}

      {/* Oyuncu Seçim Modalı */}
      <PlayerSelectModal
        isOpen={modalOpen}
        slot={selectedSlot}
        allPlayers={players || []}
        usedPlayerIds={usedPlayerIds}
        onSelect={handlePlayerSelect}
        onClose={() => {
          setModalOpen(false);
          setSelectedSlot(null);
          setSelectedTeam(null);
        }}
      />
      {/* Maç Seçim Modalı */}
      {matchSelectModalOpen && (
        <div className="modal-overlay" onClick={() => setMatchSelectModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Maç Seç</h3>
              <button className="modal-close" onClick={() => setMatchSelectModalOpen(false)}>×</button>
            </div>
            
            <div className="modal-section" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '0 10px 10px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Kadroyu bağlamak istediğiniz maçı seçin:
              </p>
              
              {modalError && (
                <div style={{
                  padding: '12px',
                  marginBottom: '15px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255, 82, 82, 0.1)',
                  border: '1px solid rgba(255, 82, 82, 0.3)',
                  color: 'var(--accent-red)',
                  fontSize: '0.85rem',
                  lineHeight: '1.4'
                }}>
                  {modalError}
                </div>
              )}

              <ul className="modal-player-list">
                {(matches || []).map(m => {
                  const isPast = new Date(m.date) < new Date();
                  const hasSquad = m.formation && Object.keys(m.squadAssignments || {}).length > 0;
                  return (
                    <li
                      key={m._id}
                      className="modal-player-item"
                      onClick={() => handleConfirmMatchSelect(m)}
                    >
                      <div className="modal-player-item__info">
                        <span className="modal-player-item__name">
                          {new Date(m.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="modal-player-item__meta">
                          {isPast ? 'Geçmiş Maç' : 'Gelecek Maç'} · Format: {m.format}
                        </span>
                      </div>
                      {hasSquad && (
                        <span className="modal-player-item__badge" style={{ backgroundColor: 'rgba(255, 23, 68, 0.15)', color: 'var(--accent-red)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>
                          Kadro Var
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
