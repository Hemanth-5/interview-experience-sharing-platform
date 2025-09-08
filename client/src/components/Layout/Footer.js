import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Simple Footer for PSG College */}
          <div className="footer-main">
            <div className="footer-brand">
              <div className="footer-logo">
                <i className="fas fa-graduation-cap"></i>
                <span className="logo-text">PSG Tech Interview Hub</span>
              </div>
              <p className="footer-description">
                Share your interview experiences and help fellow PSG College of Technology students 
                succeed in their placement journey.
              </p>
            </div>

            <div className="footer-links-simple">
              <a href="/experiences" className="footer-link">Browse Experiences</a>
              <a href="/create" className="footer-link">Share Experience</a>
              {/* <a href="/leaderboard" className="footer-link">Leaderboard</a> */}
              <a href="/about" className="footer-link">About</a>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <p className="copyright">
                © {currentYear} PSG College of Technology - Interview Experience Platform
              </p>
              <p className="college-info">
                Made with ❤️ for PSG Tech Students
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
