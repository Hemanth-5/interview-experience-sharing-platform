import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PSGNotification from '../components/PSGNotification';
import { useAuth } from '../contexts/AuthContext';
import './About.css';

const About = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });
  const contactFormRef = useRef(null);
  // const navigate = useNavigate();

  // Scroll to top when component mounts, and handle prefill
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    // Prefill subject and message from query params
    const params = new URLSearchParams(location.search);
    const prefillSubject = params.get('prefill_subject');
    const prefillBody = params.get('prefill_body');
    if (prefillBody) {
      setMessage(decodeURIComponent(prefillBody));
      // Scroll to contact form after short delay to ensure render
      setTimeout(() => {
        if (contactFormRef.current) {
          contactFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
    if (prefillSubject) {
      setSubject(decodeURIComponent(prefillSubject));
    }
  }, [location.search]);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!user) {
      setNotification({ open: true, message: 'Please log in to send a message.', type: 'error' });
      return;
    }

    if (!message.trim()) {
      setNotification({ open: true, message: 'Please enter a message before sending.', type: 'error' });
      return;
    }

    // Create simple message content
  const emailSubject = subject || `PSG Tech Interview Experience Platform - Message from ${user.name}`;
  const emailBody = `
${message}

Best regards,
${user.name}`;

    // Open Gmail with the message
  const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=22z225@psgtech.ac.in&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(gmailLink, '_blank');

    // Clear the form and show success message
    setMessage('');
    setIsSubmitting(false);
  };

  const features = [
    {
      icon: '📝',
      title: 'Share PSG Tech Experiences',
      description: 'Share detailed PSG Tech interview experiences with round-by-round breakdowns, questions, and valuable tips.'
    },
    {
      icon: '🔍',
      title: 'Search PSG Tech Interviews',
      description: 'Find PSG Tech interview experiences by department, role, or specific topics to prepare effectively.'
    },
    {
      icon: '👥',
      title: 'PSG Tech Community',
      description: 'Learn from PSG Tech students and alumni across different departments and placement experiences.'
    },
    {
      icon: '⭐',
      title: 'Rating System',
      description: 'Rate and review PSG Tech interview experiences to help fellow students identify the most helpful content.'
    },
    {
      icon: '🔖',
      title: 'Bookmark & Save',
      description: 'Save interesting PSG Tech placement experiences and build your personal preparation library.'
    },
    {
      icon: '📊',
      title: 'Analytics',
      description: 'Track your contributions and see how your shared PSG Tech experiences help other students.'
    }
  ];

  const teamMembers = [
    {
      name: 'Hemanthkumar V',
      role: 'Developer & Founder',
      image: 'https://ui-avatars.com/api/?name=Hemanthkumar+V&background=667eea&color=fff&size=200',
      description: 'Placement Representative for CSE (2026)'
    }
  ];

  const faqs = [
    {
      question: 'Is this platform only for PSG Tech students?',
      answer: 'Yes! This platform is specifically designed for PSG Tech students and alumni to share their placement and interview experiences within our college community.'
    },
    {
      question: 'Can I share experiences anonymously?',
      answer: 'Absolutely! We offer anonymous sharing options to protect your privacy while still allowing you to help fellow PSG Tech students with your valuable insights.'
    },
    {
      question: 'How do you ensure the quality of shared experiences?',
      answer: 'We have a community-driven moderation system where PSG Tech students can rate and report content. Our placement office also reviews flagged content to maintain quality standards.'
    },
    {
      question: 'Can I edit my shared experiences?',
      answer: 'Yes, you can edit your shared PSG Tech placement experiences at any time from your profile dashboard. This helps keep information current and accurate for fellow students.'
    }
  ];

  return (
    <div className="about-page">
      <PSGNotification
        open={notification.open}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ ...notification, open: false })}
      />
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Empowering PSG Tech Students' Placement Journey</h1>
          <p>
            We're building PSG Tech's largest community-driven platform for sharing 
            and discovering real placement and interview experiences. From internships to 
            dream companies, we're here to help PSG Tech students succeed.
          </p>
          <div className="hero-buttons">
            <Link to="/experiences" className="cta-btn primary">
              Explore Experiences
            </Link>
            <Link to="/create" className="cta-btn secondary">
              Share Your Story
            </Link>
          </div>
        </div>
        <div className="hero-illustration">
          <div className="illustration-circle">
            <div className="floating-icon icon-1">💼</div>
            <div className="floating-icon icon-2">🎯</div>
            <div className="floating-icon icon-3">🚀</div>
            <div className="floating-icon icon-4">⭐</div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <h2>Our Mission</h2>
          <div className="mission-content">
            <div className="mission-text">
              <p>
                Placement preparation at PSG Tech shouldn't be a mystery. Every year, thousands of 
                talented PSG Tech students miss opportunities simply because they lack access 
                to reliable, detailed information about company interview processes.
              </p>
              <p>
                We're changing that by creating a platform where PSG Tech students and alumni can share 
                their real placement experiences, detailed insights, and valuable tips with the 
                next batch of PSG Tech students.
              </p>
            </div>
            <div className="mission-highlights">
                <div className="highlight">
                  <span className="highlight-icon">🎯</span>
                  <span>Democratize PSG Tech placement preparation</span>
                </div>
                <div className="highlight">
                  <span className="highlight-icon">🤝</span>
                  <span>Build a supportive PSG Tech community</span>
                </div>
                <div className="highlight">
                  <span className="highlight-icon">📈</span>
                  <span>Increase PSG Tech placement success rates</span>
                </div>
              </div>
            </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2>Why Choose Our Platform?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Explore PSG Tech Experiences</h3>
                <p>Browse through hundreds of detailed placement experiences from PSG Tech students across various companies and departments.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Learn & Prepare</h3>
                <p>Study the questions, tips, and strategies shared by successful PSG Tech alumni and seniors.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Share Your PSG Tech Journey</h3>
                <p>After your placements, share your experience to help the next batch of PSG Tech students.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <h2>Meet Our Team</h2>
          <p className="team-intro">

          </p>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-card">
                <div className="member-image">
                  <img src={member.image} alt={member.name} />
                </div>
                <div className="member-info">
                  <h3>{member.name}</h3>
                  <p className="member-role">{member.role}</p>
                  <p className="member-description">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Start Your PSG Tech Placement Journey?</h2>
          <p>
            Join hundreds of PSG Tech students who have successfully prepared for their 
            placements using our platform. Your dream company is just one great 
            interview away!
          </p>
          <div className="cta-buttons">
            <Link to="/experiences" className="cta-btn primary large">
              Browse PSG Tech Experiences
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h3>Get in Touch</h3>
              <p>
                Have questions, suggestions, or just want to say hello? 
                The PSG Tech placement team would love to hear from you!
              </p>
              <div className="contact-methods">
                <div className="contact-method">
                  <span className="method-icon">📧</span>
                  <span>placement@psgtech.ac.in</span>
                </div>
                <div className="contact-method">
                  <span className="method-icon">💬</span>
                  <span>Visit placement office for support</span>
                </div>
              </div>
            </div>
            <div className="contact-form" ref={contactFormRef}>
              <h3>Send us a Message</h3>
              {subject && (
                <div className="form-group">
                  <input
                    type="text"
                    name="subject"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Subject"
                    style={{ width: '100%', marginBottom: 8 }}
                  />
                </div>
              )}
              {user ? (
                <>
                  {/* <div className="user-info-display">
                    <p><strong>Logged in as:</strong> {user.name} ({user.email})</p>
                  </div> */}
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <textarea 
                        name="message"
                        placeholder="Your Message" 
                        rows="6" 
                        value={message}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                    </div>
                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                      {isSubmitting ? 'Opening Gmail...' : 'Send Message'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="login-prompt">
                  <p>Please log in to send us a message.</p>
                  <Link to="/login" className="login-btn">Log In</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
