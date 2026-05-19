import { NavLink } from 'react-router-dom';
import { FaHome, FaSearch, FaChessBoard, FaCalendarAlt, FaLock } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { to: '/', label: 'Tesisler', icon: <FaHome /> },
  { to: '/scout', label: 'Scout', icon: <FaSearch /> },
  { to: '/tactics', label: 'Taktik', icon: <FaChessBoard /> },
  { to: '/fixtures', label: 'Fikstür', icon: <FaCalendarAlt /> },
  { to: '/admin', label: 'Sır Odası', icon: <FaLock /> }
];

export default function Navbar() {
  const { isPlayer, getPlayerData, isAdmin } = useAuth();
  const playerLoggedIn = isPlayer();
  const adminLoggedIn = isAdmin();
  const playerData = playerLoggedIn ? getPlayerData() : null;

  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <span className="navbar__logo">⚽</span>
        <span className="navbar__name">RB-MFL</span>
      </div>
      <ul className="navbar__links">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `navbar__link ${isActive ? 'navbar__link--active' : ''}`
              }
            >
              <span className="navbar__link-icon">{item.icon}</span>
              <span className="navbar__link-label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Giriş durumu */}
      {playerLoggedIn && playerData && (
        <NavLink to="/admin" className="navbar__user">
          <img
            className="navbar__user-photo"
            src={`/players/${playerData.photo || 'default.png'}`}
            alt={playerData.name}
            onError={e => { e.target.onerror = null; e.target.src = '/players/default.png'; }}
          />
          <span className="navbar__user-name">{playerData.name?.split(' ')[0]}</span>
        </NavLink>
      )}
      {adminLoggedIn && (
        <NavLink to="/admin" className="navbar__user navbar__user--admin">
          <span>🔐</span>
          <span className="navbar__user-name">Admin</span>
        </NavLink>
      )}
    </nav>
  );
}
