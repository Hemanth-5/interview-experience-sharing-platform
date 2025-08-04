import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { createApiUrl } from '../config/api';
import './Leaderboard.css';

// const Leaderboard = () => {
//   const [leaderboardData, setLeaderboardData] = useState([]);
//   const [topCompanies, setTopCompanies] = useState([]);
//   const [recentExperiences, setRecentExperiences] = useState([]);
//   const [stats, setStats] = useState({});
//   const [activeTab, setActiveTab] = useState('contributors');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchLeaderboardData();
//   }, []);

//   const fetchLeaderboardData = async () => {
//     try {
//       setLoading(true);
      
//       // Fetch top contributors
//       const contributorsResponse = await axios.get(createApiUrl('/api/users/leaderboard'), {
//         withCredentials: true
//       });
      
//       // Fetch top companies
//       const companiesResponse = await axios.get(createApiUrl('/api/analytics/top-companies'), {
//         withCredentials: true
//       });
      
//       // Fetch recent experiences
//       const recentResponse = await axios.get(createApiUrl('/api/experiences'), {
//         params: { limit: 6, sort: '-createdAt' },
//         withCredentials: true
//       });
      
//       // Fetch platform statistics
//       const statsResponse = await axios.get(createApiUrl('/api/analytics/platform-stats'), {
//         withCredentials: true
//       });

//       setLeaderboardData(contributorsResponse.data.data);
//       setTopCompanies(companiesResponse.data.data);
//       setRecentExperiences(recentResponse.data.data);
//       setStats(statsResponse.data.data);
//     } catch (error) {
//       setError(error.response?.data?.message || 'Failed to fetch leaderboard data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   const getRankIcon = (rank) => {
//     switch (rank) {
//       case 1: return '🥇';
//       case 2: return '🥈';
//       case 3: return '🥉';
//       default: return '🏅';
//     }
//   };

//   const renderTopContributors = () => (
//     <div className="leaderboard-section">
//       <h2>Top Contributors</h2>
//       <p className="section-description">
//         Community members who have shared the most valuable interview experiences
//       </p>
      
//       <div className="contributors-grid">
//         {leaderboardData.slice(0, 3).map((contributor, index) => (
//           <div key={contributor._id} className={`top-contributor rank-${index + 1}`}>
//             <div className="rank-badge">
//               <span className="rank-icon">{getRankIcon(index + 1)}</span>
//               <span className="rank-number">#{index + 1}</span>
//             </div>
            
//             <div className="contributor-avatar">
//               <img 
//                 src={contributor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.name)}&background=667eea&color=fff&size=128`}
//                 alt={contributor.name}
//               />
//             </div>
            
//             <div className="contributor-info">
//               <h3>{contributor.name}</h3>
//               <div className="contributor-stats">
//                 <div className="stat">
//                   <span className="stat-value">{contributor.totalExperiences}</span>
//                   <span className="stat-label">Experiences</span>
//                 </div>
//                 <div className="stat">
//                   <span className="stat-value">{contributor.totalUpvotes}</span>
//                   <span className="stat-label">Upvotes</span>
//                 </div>
//                 <div className="stat">
//                   <span className="stat-value">{contributor.helpfulnessScore}</span>
//                   <span className="stat-label">Score</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="contributors-list">
//         {leaderboardData.slice(3).map((contributor, index) => (
//           <div key={contributor._id} className="contributor-row">
//             <div className="rank">#{index + 4}</div>
//             <div className="contributor-basic">
//               <img 
//                 src={contributor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.name)}&background=667eea&color=fff&size=64`}
//                 alt={contributor.name}
//                 className="avatar-small"
//               />
//               <div className="contributor-details">
//                 <h4>{contributor.name}</h4>
//                 <span className="join-date">Joined {formatDate(contributor.joinedAt)}</span>
//               </div>
//             </div>
//             <div className="contributor-metrics">
//               <div className="metric">
//                 <span className="metric-value">{contributor.totalExperiences}</span>
//                 <span className="metric-label">Experiences</span>
//               </div>
//               <div className="metric">
//                 <span className="metric-value">{contributor.totalUpvotes}</span>
//                 <span className="metric-label">Upvotes</span>
//               </div>
//               <div className="metric">
//                 <span className="metric-value">{contributor.totalViews}</span>
//                 <span className="metric-label">Views</span>
//               </div>
//               <div className="metric highlight">
//                 <span className="metric-value">{contributor.helpfulnessScore}</span>
//                 <span className="metric-label">Score</span>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );

//   const renderTopCompanies = () => (
//     <div className="leaderboard-section">
//       <h2>Most Discussed Companies</h2>
//       <p className="section-description">
//         Companies with the most interview experiences shared on our platform
//       </p>
      
//       <div className="companies-grid">
//         {topCompanies.map((company, index) => (
//           <div key={company._id} className="company-card">
//             <div className="company-rank">#{index + 1}</div>
//             <div className="company-info">
//               <h3>{company.name}</h3>
//               <div className="company-stats">
//                 <div className="company-stat">
//                   <span className="stat-icon">📝</span>
//                   <span className="stat-text">{company.experienceCount} experiences</span>
//                 </div>
//                 <div className="company-stat">
//                   <span className="stat-icon">⭐</span>
//                   <span className="stat-text">{company.averageRating?.toFixed(1)} avg rating</span>
//                 </div>
//                 <div className="company-stat">
//                   <span className="stat-icon">💼</span>
//                   <span className="stat-text">{company.roles?.length || 0} roles</span>
//                 </div>
//               </div>
//               <div className="company-tags">
//                 {company.topRoles?.slice(0, 3).map((role, roleIndex) => (
//                   <span key={roleIndex} className="role-tag">{role}</span>
//                 ))}
//               </div>
//             </div>
//             <Link to={`/experiences?company=${encodeURIComponent(company.name)}`} className="view-experiences-btn">
//               View Experiences
//             </Link>
//           </div>
//         ))}
//       </div>
//     </div>
//   );

//   const renderRecentActivity = () => (
//     <div className="leaderboard-section">
//       <h2>Recent Activity</h2>
//       <p className="section-description">
//         Latest interview experiences shared by our community
//       </p>
      
//       <div className="recent-experiences">
//         {recentExperiences.map((experience) => (
//           <div key={experience._id} className="recent-experience">
//             <div className="experience-header">
//               <div className="company-logo">
//                 {experience.companyInfo.companyName.charAt(0)}
//               </div>
//               <div className="experience-info">
//                 <h4>{experience.companyInfo.companyName}</h4>
//                 <p>{experience.companyInfo.role}</p>
//                 <span className="time-ago">{formatDate(experience.createdAt)}</span>
//               </div>
//             </div>
            
//             <div className="experience-meta">
//               <div className="result-badge">
//                 {experience.finalResult}
//               </div>
//               <div className="experience-stats">
//                 <span>{experience.rounds.length} rounds</span>
//                 <span>{experience.overallRating}/5 ⭐</span>
//               </div>
//             </div>
            
//             <Link to={`/experiences/${experience._id}`} className="read-more">
//               Read Experience →
//             </Link>
//           </div>
//         ))}
//       </div>
//     </div>
//   );

//   const renderPlatformStats = () => (
//     <div className="platform-stats">
//       <h2>Platform Statistics</h2>
//       <div className="stats-grid">
//         <div className="stat-card">
//           <div className="stat-icon">👥</div>
//           <div className="stat-content">
//             <span className="stat-number">{stats.totalUsers || 0}</span>
//             <span className="stat-label">Community Members</span>
//           </div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-icon">📝</div>
//           <div className="stat-content">
//             <span className="stat-number">{stats.totalExperiences || 0}</span>
//             <span className="stat-label">Experiences Shared</span>
//           </div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-icon">🏢</div>
//           <div className="stat-content">
//             <span className="stat-number">{stats.totalCompanies || 0}</span>
//             <span className="stat-label">Companies Covered</span>
//           </div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-icon">💬</div>
//           <div className="stat-content">
//             <span className="stat-number">{stats.totalComments || 0}</span>
//             <span className="stat-label">Comments & Discussions</span>
//           </div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-icon">👍</div>
//           <div className="stat-content">
//             <span className="stat-number">{stats.totalUpvotes || 0}</span>
//             <span className="stat-label">Upvotes Given</span>
//           </div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-icon">📚</div>
//           <div className="stat-content">
//             <span className="stat-number">{stats.totalBookmarks || 0}</span>
//             <span className="stat-label">Bookmarks Created</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   if (loading) {
//     return (
//       <div className="leaderboard-loading">
//         <div className="loading-spinner"></div>
//         <p>Loading leaderboard...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="leaderboard-error">
//         <div className="error-icon">⚠️</div>
//         <h2>Unable to load leaderboard</h2>
//         <p>{error}</p>
//         <button onClick={fetchLeaderboardData} className="retry-btn">
//           Try Again
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="leaderboard-page">
//       <div className="leaderboard-header">
//         <h1>Community Leaderboard</h1>
//         <p>Celebrating our top contributors and the most active discussions</p>
//       </div>

//       {renderPlatformStats()}

//       <div className="leaderboard-tabs">
//         <button 
//           className={`tab-btn ${activeTab === 'contributors' ? 'active' : ''}`}
//           onClick={() => setActiveTab('contributors')}
//         >
//           Top Contributors
//         </button>
//         <button 
//           className={`tab-btn ${activeTab === 'companies' ? 'active' : ''}`}
//           onClick={() => setActiveTab('companies')}
//         >
//           Top Companies
//         </button>
//         <button 
//           className={`tab-btn ${activeTab === 'recent' ? 'active' : ''}`}
//           onClick={() => setActiveTab('recent')}
//         >
//           Recent Activity
//         </button>
//       </div>

//       <div className="tab-content">
//         {activeTab === 'contributors' && renderTopContributors()}
//         {activeTab === 'companies' && renderTopCompanies()}
//         {activeTab === 'recent' && renderRecentActivity()}
//       </div>
//     </div>
//   );
// };

// Enhanced Leaderboard component with better UX
// We'll implement the full leaderboard functionality soon
const Leaderboard = () => {
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);
  
  // Placeholder for future implementation
  return (
    <div className="leaderboard-placeholder">
      <h1>Leaderboard Coming Soon!</h1>
      <Link to="/" className="back-to-home">← Back to Home</Link>
    </div>
  );
};

export default Leaderboard;
