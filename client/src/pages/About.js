import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
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

  const stats = [
    { number: '500+', label: 'PSG Tech Experiences' },
    { number: '100+', label: 'Companies Visited' },
    { number: '25+', label: 'Different Departments' },
    { number: '95%', label: 'Student Satisfaction' }
  ];

  const teamMembers = [
    {
      name: 'Dr. Rajesh Kumar',
      role: 'Placement Officer',
      image: 'https://ui-avatars.com/api/?name=Dr+Rajesh+Kumar&background=667eea&color=fff&size=200',
      description: 'Experienced placement officer dedicated to helping PSG Tech students achieve their career goals.'
    },
    {
      name: 'Priya Sharma',
      role: 'Student Coordinator',
      image: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=764ba2&color=fff&size=200',
      description: 'PSG Tech alumna who coordinates student activities and maintains the experience sharing community.'
    },
    {
      name: 'Arjun Patel',
      role: 'Tech Lead',
      image: 'https://ui-avatars.com/api/?name=Arjun+Patel&background=10b981&color=fff&size=200',
      description: 'CSE graduate from PSG Tech focused on developing this platform for fellow students.'
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
    },
    {
      question: 'How can PSG Tech students get the most out of this platform?',
      answer: 'Start by browsing experiences from companies that visit PSG Tech, bookmark helpful content, and consider sharing your own placement experiences to give back to the PSG Tech community.'
    }
  ];

  return (
    <div className="about-page">
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
          <h2>Why Choose Our PSG Tech Platform?</h2>
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
          <h2>Meet Our PSG Tech Team</h2>
          <p className="team-intro">
            We're a passionate team of PSG Tech faculty, alumni, and students 
            dedicated to making placement preparation accessible to all PSG Tech students.
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
                  <span>placement@psgtech.edu</span>
                </div>
                <div className="contact-method">
                  <span className="method-icon">💬</span>
                  <span>Visit placement office for support</span>
                </div>
                <div className="contact-method">
                  <span className="method-icon">🏫</span>
                  <span>PSG College of Technology</span>
                </div>
              </div>
            </div>
            <div className="contact-form">
              <h3>Send us a Message</h3>
              <form>
                <div className="form-group">
                  <input type="text" placeholder="Your Name" required />
                </div>
                <div className="form-group">
                  <input type="email" placeholder="Your Email" required />
                </div>
                <div className="form-group">
                  <textarea placeholder="Your Message" rows="4" required></textarea>
                </div>
                <button type="submit" className="submit-btn">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
