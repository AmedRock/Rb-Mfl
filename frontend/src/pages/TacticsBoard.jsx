import { useState, useMemo } from 'react';
import { useFetch, apiPost } from '../hooks/useFetch';
import { FORMATS, FORMATIONS, generateSlots, mirrorSlots } from '../utils/formations';
import { autoFillSlots, balanceTeams } from '../utils/teamBalancer';
import PitchField from '../components/tactics/PitchField';
import PlayerSelectModal from '../components/tactics/PlayerSelectModal';
import TeamPowerBar from '../components/tactics/TeamPowerBar';
import { FaMagic, FaBalanceScale, FaSave, FaTrashAlt } from 'react-icons/fa';
import '../styles/tactics.css';

export default function TacticsBoard() {
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

  // Oyuncuları backend'den çek
  const { data: players } = useFetch('/players');

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

  // Otomatik doldur
  const handleAutoFill = () => {
    if (!players || players.length === 0) return;

    // Önce Takım A'yı doldur
    const newA = autoFillSlots(teamASlots, players, teamAAssignments);
    
    // Takım A'da kullanılanları Takım B'den hariç tut
    const usedInA = new Set(Object.values(newA).filter(Boolean).map(p => p._id));
    const remainingForB = players.filter(p => !usedInA.has(p._id));
    const newB = autoFillSlots(teamBSlots, remainingForB, teamBAssignments);

    setTeamAAssignments(newA);
    setTeamBAssignments(newB);
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

  // Kadroyu kaydet
  const handleSave = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      const teamAPlayerIds = Object.values(teamAAssignments).filter(Boolean).map(p => p._id);
      const teamBPlayerIds = Object.values(teamBAssignments).filter(Boolean).map(p => p._id);

      await apiPost('/matches', {
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Varsayılan: 1 hafta sonra
        format: format,
        status: 'upcoming',
        teamA: { players: teamAPlayerIds, name: 'Takım A' },
        teamB: { players: teamBPlayerIds, name: 'Takım B' }
      });
      setSaveMessage('✅ Kadro başarıyla kaydedildi!');
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
            <div className="tactics__save-message animate-fade-in">
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
    </div>
  );
}
