import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'store_owner') return '/owner/dashboard';
    return '/user/stores';
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to={getDashboardLink()}>
          <span className="brand-icon">⭐</span>
          <span className="brand-text">StoreRate</span>
        </Link>
      </div>
      <div className="navbar-links">
        {user && (
          <>
            <span className="nav-user">
              <span className="nav-avatar">{user.name?.charAt(0).toUpperCase()}</span>
              <span className="nav-name">{user.name?.split(' ')[0]}</span>
              <span className={`nav-role role-${user.role}`}>{user.role.replace('_', ' ')}</span>
            </span>
            {(user.role === 'user' || user.role === 'store_owner') && (
              <Link to="/update-password" className="nav-link">Change Password</Link>
            )}
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
