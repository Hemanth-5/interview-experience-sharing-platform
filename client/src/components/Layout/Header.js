import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: 'fas fa-home' },
    { path: '/experiences', label: 'Experiences', icon: 'fas fa-briefcase' },
    { path: '/leaderboard', label: 'Leaderboard', icon: 'fas fa-trophy' },
    { path: '/about', label: 'About', icon: 'fas fa-info-circle' },
  ];

  return (
    <header className="header">
      <nav className="nav">
        <div className="container">
          <div className="nav-content">
            {/* Logo */}
            <Link to="/" className="logo">
              <i className="fas fa-handshake"></i>
              <span className="logo-text">InterviewShare</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="nav-links desktop-nav">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link ${isActiveLink(link.path) ? 'active' : ''}`}
                >
                  <i className={link.icon}></i>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>

            {/* User Actions */}
            <div className="nav-actions">
              {isAuthenticated ? (
                <>
                  {/* <Link to="/create" className="btn btn-primary btn-sm create-btn">
                    <i className="fas fa-plus"></i>
                    <span className="hidden md:inline">Share Experience</span>
                  </Link> */}
                  
                  <div className="dropdown user-menu" ref={userMenuRef}>
                    <button
                      className="user-menu-toggle"
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    >
                      <img
                        src={user?.avatar || '/default-avatar.png'}
                        alt={user?.name}
                        className="user-avatar"
                      />
                      <span className="user-name hidden md:inline">{user?.name}</span>
                      <i className={`fas fa-chevron-down ${isUserMenuOpen ? 'rotate' : ''}`}></i>
                    </button>

                    <div className={`dropdown-menu ${isUserMenuOpen ? 'show' : ''}`}>
                      <div className="user-info">
                        <div className="user-details">
                          <div className="user-name-mobile">{user?.name}</div>
                          <div className="user-email">{user?.email}</div>
                        </div>
                      </div>
                      <div className="dropdown-divider"></div>
                      <Link to="/profile" className="dropdown-item">
                        <i className="fas fa-user"></i>
                        Profile
                      </Link>
                      <div className="dropdown-divider"></div>
                      <button onClick={handleLogout} className="dropdown-item">
                        <i className="fas fa-sign-out-alt"></i>
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <button onClick={handleLogin} className="btn btn-primary btn-sm">
                  {/* <i className="fab fa-google"></i> */}
                  <span>Login</span>
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                className="mobile-menu-toggle md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className={`mobile-nav md:hidden ${isMenuOpen ? 'show' : ''}`}>
            <div className="mobile-nav-links">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`mobile-nav-link ${isActiveLink(link.path) ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className={link.icon}></i>
                  <span>{link.label}</span>
                </Link>
              ))}
              
              {/* {isAuthenticated && (
                <Link
                  to="/create"
                  className="mobile-nav-link create-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-plus"></i>
                  <span>Share Experience</span>
                </Link>
              )} */}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
