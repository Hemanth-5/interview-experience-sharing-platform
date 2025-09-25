import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { extractUserName } from '../../utils/avatar';
import Avatar from '../../components/Avatar';
import { 
  Home, 
  FileText, 
  Users, 
  Building2, 
  Download, 
  BarChart3, 
  Megaphone, 
  FileUp, 
  ArrowLeft, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Shield,
  Bell,
  HelpCircle
} from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const userMenuRef = useRef(null);
  const displayName = user?.name ? extractUserName(user.name) : '';

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const adminMenuItems = [
    { path: '/admin', label: 'Dashboard', icon: Home, exact: true },
    { path: '/admin/experiences', label: 'Experiences', icon: FileText },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/companies', label: 'Companies', icon: Building2 },
    { path: '/admin/company-requests', label: 'Company Requests', icon: HelpCircle },
    { path: '/admin/download-experiences', label: 'Download Experiences', icon: Download },
    { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { path: '/admin/announcement', label: 'Announcements', icon: Megaphone },
    { path: '/admin/pdf', label: 'Parse PDF', icon: FileUp }
  ];

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setIsUserMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActiveRoute = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Admin Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-700/30 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <Link 
              to="/" 
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Back to Site</span>
            </Link>
            
            {/* <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 hidden sm:block">
                Admin Panel
              </h1>
            </div> */}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <Avatar 
                  user={user}
                  size={32}
                  className="ring-2 ring-blue-100 dark:ring-blue-900/30 flex-shrink-0"
                />
                <span className="hidden sm:block text-sm font-medium text-gray-900 dark:text-gray-100">
                  {displayName}
                </span>
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <div className="flex items-center space-x-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <Avatar 
                      user={user}
                      size={48}
                      className="ring-2 ring-blue-100 dark:ring-blue-900/30 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {displayName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                  
                  <Link 
                    to="/settings" 
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen pt-16">
        {/* Admin Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/20 dark:border-gray-700/30 transform transition-transform duration-300 ease-in-out pt-16 lg:translate-x-0 lg:static lg:pt-0 lg:z-auto ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <nav className="flex flex-col h-full">
            <div className="flex items-center space-x-3 px-6 py-6 border-b border-gray-200 dark:border-gray-700 lg:hidden">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Admin Panel</span>
            </div>
            
            <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {adminMenuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = item.exact 
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <IconComponent className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Admin Main Content */}
        <main className="flex-1 min-h-screen lg:ml-0">
          <div className="p-6 lg:p-8 max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
