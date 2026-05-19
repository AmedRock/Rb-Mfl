import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Scout from './pages/Scout';
import PlayerProfile from './pages/PlayerProfile';
import TacticsBoard from './pages/TacticsBoard';
import Fixtures from './pages/Fixtures';
import FixtureDetail from './pages/FixtureDetail';
import AdminPanel from './pages/AdminPanel';
import './styles/globals.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="scout" element={<Scout />} />
          <Route path="player/:id" element={<PlayerProfile />} />
          <Route path="tactics" element={<TacticsBoard />} />
          <Route path="fixtures" element={<Fixtures />} />
          <Route path="fixture/:id" element={<FixtureDetail />} />
          <Route path="admin" element={<AdminPanel />} />
        </Route>
      </Routes>
    </Router>
  );
}

function ComingSoon({ title, emoji }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      gap: '12px'
    }}>
      <span style={{ fontSize: '4rem' }}>{emoji}</span>
      <h1 style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>{title}</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Bu sayfa yakında aktif olacak!</p>
    </div>
  );
}

export default App;
