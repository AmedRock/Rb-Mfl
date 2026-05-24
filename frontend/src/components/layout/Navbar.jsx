import { NavLink } from 'react-router-dom';
import { FaHome, FaSearch, FaChessBoard, FaCalendarAlt, FaSignInAlt, FaUser, FaLock } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { isPlayer, getPlayerData, isAdmin } = useAuth();
  const playerLoggedIn = isPlayer();
  const adminLoggedIn = isAdmin();

  // Son nav item'ı duruma göre belirle
  let authItem;
  if (playerLoggedIn) {
    authItem = { to: '/admin', label: 'Profilim', icon: <FaUser /> };
  } else if (adminLoggedIn) {
    authItem = { to: '/admin', label: 'Admin', icon: <FaLock /> };
  } else {
    authItem = { to: '/admin', label: 'Giriş Yap', icon: <FaSignInAlt /> };
  }

  const navItems = [
    { to: '/', label: 'Tesisler', icon: <FaHome /> },
    { to: '/scout', label: 'Scout', icon: <FaSearch /> },
    { to: '/tactics', label: 'Taktik', icon: <FaChessBoard /> },
    { to: '/fixtures', label: 'Fikstür', icon: <FaCalendarAlt /> },
    authItem
  ];

  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <span className="navbar__logo">⚽</span>
        <span className="navbar__name">RB-MFL</span>
      </div>
      <ul className="navbar__links">
        {navItems.map((item) => (
          <li key={item.to + item.label}>
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
    </nav>
  );
}
