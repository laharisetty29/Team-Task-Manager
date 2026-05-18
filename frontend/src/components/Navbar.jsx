import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiGrid, FiFolderPlus, FiCheckSquare, FiLogOut, FiUser } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">⚡</span>
        <span className="brand-text">TaskFlow</span>
      </div>

      <div className="navbar-links">
        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
          <FiGrid /> Dashboard
        </Link>
        <Link to="/projects" className={`nav-link ${isActive('/projects') ? 'active' : ''}`}>
          <FiFolderPlus /> Projects
        </Link>
        <Link to="/tasks" className={`nav-link ${isActive('/tasks') ? 'active' : ''}`}>
          <FiCheckSquare /> My Tasks
        </Link>
      </div>

      <div className="navbar-user">
        <div className="user-info">
          <FiUser />
          <span>{user?.name}</span>
          <span className={`role-badge ${user?.role}`}>{user?.role}</span>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          <FiLogOut /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;