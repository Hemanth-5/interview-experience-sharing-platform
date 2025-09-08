import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { extractUserName } from '../../utils/avatar';
import '../styles/admin.css';
import '../styles/AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const displayName = user?.name ? extractUserName(user.name) : '';

  // console.log(user)


  const adminMenuItems = [
    { path: '/admin', label: 'Dashboard', exact: true },
    { path: '/admin/experiences', label: 'Experiences' },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/companies', label: 'Companies' },
    { path: '/admin/download-experiences', label: 'Download Experiences' },
    { path: '/admin/reports', label: 'Reports' },
    { path: '/admin/announcement', label: 'Announcements' },
    { path: '/admin/pdf', label: 'Parse PDF' }
  ];

  const isActiveRoute = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-nav">
          <Link to="/" className="back-to-site">
            <i className="fa fa-arrow-left" aria-hidden="true" style={{ marginRight: '6px' }}></i>
            Back to Site
          </Link>
          <h1 className="admin-title">
            <i className="fa fa-cogs" aria-hidden="true" style={{ marginRight: '8px' }}></i>
            Admin Panel
          </h1>
          <div className="admin-user-info">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={displayName}
                className="admin-user-avatar"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  marginRight: '8px',
                  verticalAlign: 'middle'
                }}
              />
            ) : (
              <i className="fa fa-user-circle" aria-hidden="true" style={{ marginRight: '4px', fontSize: '32px', verticalAlign: 'middle' }}></i>
            )}
            <span className="welcome-text">
              {displayName}
            </span>
            <Link to="/" onClick={logout} className="logout-link">
              <i className="fa fa-sign-out" aria-hidden="true" style={{ marginRight: '4px' }}></i>
              Logout
            </Link>
          </div>
        </div>
      </header>

      <div className="admin-content">
        {/* Admin Sidebar */}
        <aside className="admin-sidebar">
          <nav>
            <ul className="admin-menu">
              {adminMenuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`admin-menu-item ${
                      isActiveRoute(item.path, item.exact) ? 'active' : ''
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Admin Main Content */}
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
