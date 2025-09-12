import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './PageNotFound.css';

// SVG Icon for the "Home" button
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

// New Animated Illustration Component (styled via CSS)
const LostAstronaut = () => (
  <div className="illustration-container">
    <div className="stars"></div>
    <div className="planet"></div>
    <div className="astronaut">
      <div className="astronaut__body"></div>
      <div className="astronaut__helmet">
        <div className="astronaut__visor"></div>
      </div>
      <div className="astronaut__backpack"></div>
      <div className="astronaut__tether"></div>
    </div>
    <div className="text-404">
        <span className="char-4">4</span>
        <span className="char-0">0</span>
        <span className="char-4">4</span>
    </div>
  </div>
);

const PageNotFound = () => {
  const containerRef = useRef(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Parallax effect on mouse move
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const moveX = (clientX / innerWidth - 0.5) * 2;
      const moveY = (clientY / innerHeight - 0.5) * 2;

      // Apply transformation via CSS variables for different layers
      container.style.setProperty('--move-x-astronaut', `${moveX * -20}px`);
      container.style.setProperty('--move-y-astronaut', `${moveY * -20}px`);
      container.style.setProperty('--move-x-planet', `${moveX * -10}px`);
      container.style.setProperty('--move-y-planet', `${moveY * -10}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="page-not-found-placeholder" ref={containerRef}>
      <LostAstronaut />

      <h1>Page Not Found</h1>
      <p>
        It seems the page you are looking for has been moved, deleted, or never existed
      </p>

      <div className="page-not-found-action-buttons">
        <Link to="/" className="back-to-home primary">
          <HomeIcon />
          Back to Home
        </Link>
        <Link to="/experiences" className="back-to-home secondary">
          Browse Experiences
        </Link>
      </div>
    </div>
  );
};

export default PageNotFound;