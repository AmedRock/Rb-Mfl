import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import AdminLogin from '../components/admin/AdminLogin';
import AddMatchTab from '../components/admin/AddMatchTab';
import SubmitResultTab from '../components/admin/SubmitResultTab';
import ManagePlayersTab from '../components/admin/ManagePlayersTab';
import BadgesTab from '../components/admin/BadgesTab';
import ScandalTab from '../components/admin/ScandalTab';
import '../styles/admin.css';

const TABS = [
  { id: 'add-match', label: '📅 Maç Ekle' },
  { id: 'result', label: '🏆 Sonuç Gir' },
  { id: 'players', label: '⚽ Oyuncular' },
  { id: 'badges', label: '🏅 Rozetler' },
  { id: 'scandal', label: '📰 Skandal' }
];

export default function AdminPanel() {
  const { isAdmin, login, logout, authHeader } = useAuth();
  const [activeTab, setActiveTab] = useState('add-match');
  const [adminLoggedIn, setAdminLoggedIn] = useState(isAdmin());

  const handleLogin = (token) => {
    login(token);
    setAdminLoggedIn(true);
  };

  const handleLogout = () => {
    logout();
    setAdminLoggedIn(false);
  };

  if (!adminLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="admin-panel">
      {/* Üst bar */}
      <div className="admin-panel__topbar">
        <div className="admin-panel__brand">
          <span>🔐</span>
          <span className="admin-panel__brand-name">Sır Odası</span>
        </div>
        <button className="admin-logout-btn" onClick={handleLogout}>
          Çıkış Yap
        </button>
      </div>

      <div className="admin-panel__body">
        {/* Sol sekme menüsü */}
        <nav className="admin-panel__nav">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`admin-nav-item ${activeTab === tab.id ? 'admin-nav-item--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* İçerik alanı */}
        <div className="admin-panel__content">
          {activeTab === 'add-match' && <AddMatchTab authHeader={authHeader()} />}
          {activeTab === 'result' && <SubmitResultTab authHeader={authHeader()} />}
          {activeTab === 'players' && <ManagePlayersTab authHeader={authHeader()} />}
          {activeTab === 'badges' && <BadgesTab authHeader={authHeader()} />}
          {activeTab === 'scandal' && <ScandalTab authHeader={authHeader()} />}
        </div>
      </div>
    </div>
  );
}
