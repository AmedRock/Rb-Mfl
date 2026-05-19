import { NavLink } from 'react-router-dom';
import { FaHome, FaSearch, FaChessBoard, FaCalendarAlt, FaLock } from 'react-icons/fa';

const navItems = [
  { to: '/', label: 'Tesisler', icon: <FaHome /> },
  { to: '/scout', label: 'Scout', icon: <FaSearch /> },
  { to: '/tactics', label: 'Taktik', icon: <FaChessBoard /> },
  { to: '/fixtures', label: 'Fikstür', icon: <FaCalendarAlt /> },
  { to: '/admin', label: 'Sır Odası', icon: <FaLock /> }
];

export default function Navbar() {
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
    </nav>
  );
}
