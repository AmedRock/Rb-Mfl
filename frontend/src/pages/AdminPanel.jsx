import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import GateScreen from '../components/admin/GateScreen';
import MyProfilePanel from '../components/admin/MyProfilePanel';
import AddMatchTab from '../components/admin/AddMatchTab';
import SubmitResultTab from '../components/admin/SubmitResultTab';
import ManagePlayersTab from '../components/admin/ManagePlayersTab';
import BadgesTab from '../components/admin/BadgesTab';
import ScandalTab from '../components/admin/ScandalTab';
import PendingPlayersTab from '../components/admin/PendingPlayersTab';
import '../styles/admin.css';

const ADMIN_TABS = [
  { id: 'add-match', label: '📅 Maç Ekle' },
  { id: 'result', label: '🏆 Sonuç Gir' },
  { id: 'players', label: '⚽ Oyuncular' },
  { id: 'pending', label: '👤 Onaylar' },
  { id: 'badges', label: '🏅 Rozetler' },
  { id: 'scandal', label: '📰 Skandal' }
];

export default function AdminPanel() {
  // authState context'ten gelir — reactive, lokal kopyaya gerek yok
  const { authState, loginAdmin, loginPlayer, logout, adminAuthHeader } = useAuth();
  const [activeTab, setActiveTab] = useState('add-match');

  // Giriş yapılmamış → GateScreen
  if (!authState) {
    return (
      <GateScreen
        onAdminLogin={loginAdmin}
        onPlayerLogin={loginPlayer}
      />
    );
  }

  // Oyuncu girişi → Kendi profili
  if (authState === 'player') {
    return <MyProfilePanel onLogout={logout} />;
  }

  // Admin girişi → Sır Odası
  return (
    <div className="admin-panel">
      <div className="admin-panel__body">
        <nav className="admin-panel__nav">
          {ADMIN_TABS.map(tab => (
            <button
              key={tab.id}
              className={`admin-nav-item ${activeTab === tab.id ? 'admin-nav-item--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button className="admin-logout-btn" style={{ margin: '8px 12px' }} onClick={logout}>
            Çıkış Yap
          </button>
        </nav>

        <div className="admin-panel__content">
          {activeTab === 'add-match' && <AddMatchTab authHeader={adminAuthHeader()} />}
          {activeTab === 'result' && <SubmitResultTab authHeader={adminAuthHeader()} />}
          {activeTab === 'players' && <ManagePlayersTab authHeader={adminAuthHeader()} />}
          {activeTab === 'pending' && <PendingPlayersTab authHeader={adminAuthHeader()} />}
          {activeTab === 'badges' && <BadgesTab authHeader={adminAuthHeader()} />}
          {activeTab === 'scandal' && <ScandalTab authHeader={adminAuthHeader()} />}
        </div>
      </div>
    </div>
  );
}

