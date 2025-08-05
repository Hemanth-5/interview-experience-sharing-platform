import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createApiUrl } from '../config/api';
import CompanyLogo from '../components/CompanyLogo';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentExperiences, setRecentExperiences] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [featuredExperience, setFeaturedExperience] = useState(null);
  const [loading, setLoading] = useState(true);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      // Fetch stats, recent experiences, top companies, and featured experience
      const [statsResponse, experiencesResponse, companiesResponse, featuredResponse] = await Promise.all([
        fetch(createApiUrl('/api/analytics/platform-stats')),
        fetch(createApiUrl('/api/experiences?limit=6&sort=-createdAt')),
        fetch(createApiUrl('/api/analytics/top-companies?limit=6')),
        fetch(createApiUrl('/api/experiences/featured?limit=1'))
      ]);

      if (experiencesResponse.ok) {
        const experiencesData = await experiencesResponse.json();
        setRecentExperiences(experiencesData.data || []);
      }

      if (companiesResponse.ok) {
        const companiesData = await companiesResponse.json();
        setTopCompanies(companiesData.data || []);
<<<<<<< Updated upstream
=======
        // console.log('Top Companies Full Response:', companiesData);
        // console.log('First Company Data:', companiesData.data?.[0]);
        // console.log('First Company Logo:', companiesData.data?.[0]?.logo);
>>>>>>> Stashed changes
      }

      if (featuredResponse.ok) {
        const featuredData = await featuredResponse.json();
        setFeaturedExperience(featuredData.data?.[0] || null);
      }
    } catch (error) {
      // console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get company logo based on name
  // const getCompanyLogo = (companyName) => {
  //   const logoMap = {
  //     'TCS': '💼',
  //     'Infosys': '🏢',
  //     'Wipro': '🔧',
  //     'Cognizant': '⚡',
  //     'Zoho': '🌐',
  //     'Accenture': '🎯',
  //     'Microsoft': '🔷',
  //     'Google': '🌈',
  //     'Amazon': '📦',
  //     'Default': '🏢'
  //   };
  //   return logoMap[companyName] || logoMap['Default'];
  // };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-layout">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              PSG Tech Interview Experiences
              <span className="hero-highlight"> by Students, for Students</span>
            </h1>
            <p className="hero-subtitle">
              Connect with your seniors and peers at PSG College of Technology. 
              Share interview experiences, get placement tips, and help each other 
              succeed in your career journey.
            </p>
            <div className="hero-actions">
              {user ? (
                <Link to="/create" className="btn btn-primary btn-lg">
                  <i className="fas fa-plus"></i>
                  Share Your Experience
                </Link>
              ) : (
                <button onClick={() => navigate('/login')} className="btn btn-primary btn-lg">
                  <i className="fab fa-login"></i>
                  Sign in
                </button>
              )}
              <Link to="/experiences" className="btn btn-outline btn-lg">
                <i className="fas fa-search"></i>
                Browse Experiences
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            {featuredExperience ? (
              <div className="hero-card">
                <div className="hero-card-header">
                  <CompanyLogo 
                    companyName={featuredExperience.companyInfo?.companyName} 
                    size={48}
                    className="hero-company-logo"
                  />
                  <div className="company-info">
                    <h3>{featuredExperience.companyInfo?.role} at {featuredExperience.companyInfo?.companyName}</h3>
                    <p>{featuredExperience.companyInfo?.location} - {featuredExperience.companyInfo?.department}</p>
                  </div>
                </div>
                <div className="hero-card-content">
                  <p>"{featuredExperience.overallExperience?.substring(0, 80)}..."</p>
                  <div className="hero-card-meta">
                    <span className="rating">
                      {'⭐'.repeat(featuredExperience.overallRating || 5)}
                    </span>
                    <span className="date">
                      {new Date(featuredExperience.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hero-card">
                <div className="hero-card-header">
                  <div className="company-logo">PSG</div>
                  <div className="company-info">
                    <h3>Be the First to Share!</h3>
                    <p>Your experience matters</p>
                  </div>
                </div>
                <div className="hero-card-content">
                  <p>"Help your fellow PSG students by sharing your interview experience. Be the first one to start the journey!"</p>
                  <div className="hero-card-meta">
                    <span className="rating">⭐⭐⭐⭐⭐</span>
                    <span className="date">Start today</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why PSG Tech Hub Section */}
      <section className="value-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why PSG Tech Interview Hub?</h2>
            <p className="section-subtitle">
              Built by PSG students, for PSG students - your success is our mission
            </p>
          </div>
          <div className="value-grid">
            <div className="value-card">
              <div className="value-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3 className="value-title">Real PSG Experiences</h3>
              <p className="value-description">
                Authentic interview experiences shared by your seniors and peers from PSG College of Technology
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <i className="fas fa-lightbulb"></i>
              </div>
              <h3 className="value-title">Insider Tips & Tricks</h3>
              <p className="value-description">
                Get exclusive preparation strategies, common questions, and insider knowledge that you won't find elsewhere
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <i className="fas fa-network-wired"></i>
              </div>
              <h3 className="value-title">PSG Alumni Network</h3>
              <p className="value-description">
                Connect with successful PSG graduates working in top companies across the globe
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <i className="fas fa-rocket"></i>
              </div>
              <h3 className="value-title">Career Growth</h3>
              <p className="value-description">
                Track your progress, learn from failures, and accelerate your journey to dream companies
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Companies */}
      <section className="companies-section">
        <div className="container">
          <div className="section-header target-companies-header">
            <h2 className="section-title">Popular Target Companies</h2>
            <p className="section-subtitle">
              {topCompanies.length > 0 ? 'Where PSG students commonly get placed' : 'Be the first to share your experience!'}
            </p>
          </div>
          <div className="companies-grid">
            {topCompanies.length > 0 ? (
              topCompanies.map((company, index) => (
                <Link 
                  key={index} 
                  to={`/experiences?company=${encodeURIComponent(company._id)}`}
                  className="company-card"
                >
                  <CompanyLogo 
                    companyName={company._id} 
                    size={60}
                    className="company-logo-large"
                  />
                  <div className="company-details">
                    <h3 className="company-name">{company._id}</h3>
                    <p className="company-count">{company.count} experience{company.count !== 1 ? 's' : ''}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🎯</div>
                <h3>No Company Data Yet</h3>
                <p>Be the first PSG student to share your interview experience and help build our community database!</p>
                {user ? (
                  <Link to="/create" className="btn btn-primary">
                    Share First Experience
                  </Link>
                ) : (
                  <button onClick={() => navigate('/login')} className="btn btn-primary">
                    Sign In to Share
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recent Experiences */}
      {recentExperiences.length > 0 && (
        <section className="featured-section">
          <div className="container">
            <div className="section-header recent-experiences-header">
              <h2 className="section-title">Recent Experiences</h2>
              <p className="section-subtitle">
                Latest sharing from your fellow PSG students
              </p>
            </div>
            <div className="experiences-grid">
              {recentExperiences.slice(0, 6).map((experience) => (
                <Link 
                  key={experience._id} 
                  to={`/experiences/${experience._id}`}
                  className="experience-card"
                >
                  <div className="experience-header">
                    <div className="company-info">
                      <h3 className="company-name">{experience.companyInfo?.companyName}</h3>
                      <p className="role">{experience.companyInfo?.role}</p>
                    </div>
                    <span className={`result-badge ${experience.finalResult?.toLowerCase()}`}>
                      {experience.finalResult}
                    </span>
                  </div>
                  <div className="experience-meta">
                    <div className="experience-details">
                      <span className="department">{experience.companyInfo?.department}</span>
                      <span className="location">{experience.companyInfo?.location}</span>
                    </div>
                    <div className="experience-stats">
                      <span className="rating">⭐ {experience.overallRating}/5</span>
                      <span className="rounds">{experience.rounds?.length} rounds</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="section-footer">
              <Link to="/experiences" className="btn btn-outline">
                View All Experiences
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      {/* <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Help Your Juniors Succeed</h2>
            <p>Share your interview experience and be part of the PSG Tech community that supports each other.</p>
            {user ? (
              <Link to="/create" className="btn btn-primary btn-lg">
                Share Your Experience
              </Link>
            ) : (
              <button onClick={() => window.location.href = createApiUrl('/auth/google')} className="btn btn-primary btn-lg">
                Join PSG Tech Community
              </button>
            )}
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default Home;
