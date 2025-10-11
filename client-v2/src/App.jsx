import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { NotificationProvider, useNotification } from './contexts/NotificationContext.jsx';
import { BrowserCompatibilityProvider } from './contexts/BrowserCompatibilityContext.jsx';
import Header from './components/Layout/Header.jsx';
import Footer from './components/Layout/Footer.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import FirstTimeNotificationPopup from './components/FirstTimeNotificationPopup.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Experiences from './pages/Experiences.jsx';
import ExperienceDetail from './pages/ExperienceDetail.jsx';
import CreateExperience from './pages/CreateExperience.jsx';
import EditExperience from './pages/EditExperience.jsx';
import Profile from './pages/Profile.jsx';
import UserPublicProfile from './pages/UserPublicProfile.jsx';
// import Dashboard from './pages/Dashboard.jsx';
import Settings from './pages/Settings.jsx';
import Notifications from './pages/Notifications.jsx';
// import Leaderboard from './pages/Leaderboard';
import About from './pages/About.jsx';
import PageNotFound from './pages/PageNotFound.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import DesktopModePrompt from './components/DesktopModePrompt.jsx';
import AdminRoute from './admin/components/AdminRoute.jsx';
import AdminLayout from './admin/components/AdminLayout.jsx';
import AdminDashboard from './admin/pages/AdminDashboard.jsx';
import AdminUsers from './admin/pages/AdminUsers.jsx';
import AdminExperiences from './admin/pages/AdminExperiences.jsx';
import AdminAnnouncement from "./admin/pages/AdminAnnouncement.jsx";
import AdminCompanies from './admin/pages/AdminCompanies.jsx';
import AdminCompanyRequests from './admin/pages/AdminCompanyRequests.jsx';
import AdminParsePdfPage from './admin/pages/AdminParsePdfPage.jsx';
import AdminDownloadExperiences from './admin/pages/AdminDownloadExperiences.jsx';
import AdminReports from './admin/pages/AdminReports.jsx';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { showFirstTimePopup, unreadCount, latestUnreadNotifications, dismissFirstTimePopup } = useNotification();

  return (
    <div className={isAdminRoute ? "App" : "min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/30 transition-colors duration-300"}>
      {!isAdminRoute && <Header />}
      <main className={isAdminRoute ? '' : 'main-content'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/experiences" element={<Experiences />} />
          <Route 
            path="/experiences/:id" 
            element={
              <PrivateRoute>
                <ExperienceDetail />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/experiences/:id/edit" 
            element={
              <PrivateRoute>
                <EditExperience />
              </PrivateRoute>
            } 
          />
          {/* <Route path="/leaderboard" element={<Leaderboard />} /> */}
          <Route path="/about" element={<About />} />
          <Route 
            path="/create" 
            element={
              <PrivateRoute>
                <CreateExperience />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
          {/* <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          /> */}
          <Route 
            path="/settings" 
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            } 
          />
          <Route path="/users/:userId" element={<UserPublicProfile />} />
          <Route 
            path="/notifications" 
            element={
              <PrivateRoute>
                <Notifications />
              </PrivateRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/*" 
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="experiences" element={<AdminExperiences />} />
            <Route path="download-experiences" element={<AdminDownloadExperiences />} />
            <Route path="analytics" element={<AdminDashboard />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="companies" element={<AdminCompanies />} />
            <Route path="company-requests" element={<AdminCompanyRequests />} />
            <Route path="announcement" element={<AdminAnnouncement />} />
            <Route path="pdf" element={<AdminParsePdfPage />} />
          </Route>
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
      {/* <DesktopModePrompt /> */}
      
      {/* First Time Notification Popup */}
      <FirstTimeNotificationPopup 
        open={showFirstTimePopup}
        onClose={dismissFirstTimePopup}
        notificationCount={unreadCount}
        notifications={latestUnreadNotifications}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserCompatibilityProvider>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <ScrollToTop />
              <AppContent />
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserCompatibilityProvider>
  );
}

export default App;