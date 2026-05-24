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
  const { isAdmin, isPlayer, loginAdmin, loginPlayer, logoutAdmin, logoutPlayer, adminAuthHeader } = useAuth();
  const [activeTab, setActiveTab] = useState('add-match');
  const [loggedIn, setLoggedIn] = useState(isAdmin() ? 'admin' : isPlayer() ? 'player' : null);

  const handleAdminLogin = (token) => {
    loginAdmin(token);
    setLoggedIn('admin');
  };

  const handlePlayerLogin = (token, playerData) => {
    loginPlayer(token, playerData);
    setLoggedIn('player');
  };

  const handleLogout = () => {
    if (loggedIn === 'admin') logoutAdmin();
    else logoutPlayer();
    setLoggedIn(null);
  };

  // Giriş yapılmamış → GateScreen göster
  if (!loggedIn) {
    return <GateScreen onAdminLogin={handleAdminLogin} onPlayerLogin={handlePlayerLogin} />;
  }

  // Oyuncu girişi → Kendi profili
  if (loggedIn === 'player') {
    return <MyProfilePanel onLogout={handleLogout} />;
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
          <button className="admin-logout-btn" style={{ margin: '8px 12px' }} onClick={handleLogout}>
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
