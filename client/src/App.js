import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Experiences from './pages/Experiences';
import ExperienceDetail from './pages/ExperienceDetail';
import CreateExperience from './pages/CreateExperience';
import EditExperience from './pages/EditExperience';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import About from './pages/About';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/experiences" element={<Experiences />} />
              <Route path="/experiences/:id" element={<ExperienceDetail />} />
              <Route 
                path="/experiences/:id/edit" 
                element={
                  <PrivateRoute>
                    <EditExperience />
                  </PrivateRoute>
                } 
              />
              <Route path="/leaderboard" element={<Leaderboard />} />
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
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
