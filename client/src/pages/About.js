import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
  const features = [
    {
      icon: '📝',
      title: 'Share Experiences',
      description: 'Share detailed interview experiences with round-by-round breakdowns, questions, and valuable tips.'
    },
    {
      icon: '🔍',
      title: 'Smart Search',
      description: 'Find experiences by company, role, or specific interview topics to prepare effectively.'
    },
    {
      icon: '👥',
      title: 'Community Driven',
      description: 'Learn from a diverse community of candidates across different companies and roles.'
    },
    {
      icon: '⭐',
      title: 'Rating System',
      description: 'Rate and review experiences to help others identify the most helpful content.'
    },
    {
      icon: '🔖',
      title: 'Bookmark & Save',
      description: 'Save interesting experiences and build your personal preparation library.'
    },
    {
      icon: '📊',
      title: 'Analytics',
      description: 'Track your contributions and see how your shared experiences help others.'
    }
  ];

  const stats = [
    { number: '1000+', label: 'Experiences Shared' },
    { number: '500+', label: 'Companies Covered' },
    { number: '50+', label: 'Different Roles' },
    { number: '95%', label: 'User Satisfaction' }
  ];

  const teamMembers = [
    {
      name: 'Alex Johnson',
      role: 'Founder & CEO',
      image: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=667eea&color=fff&size=200',
      description: 'Former software engineer at Google with passion for helping students succeed.'
    },
    {
      name: 'Sarah Chen',
      role: 'Head of Community',
      image: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=764ba2&color=fff&size=200',
      description: 'Community building expert who ensures our platform remains helpful and inclusive.'
    },
    {
      name: 'Mike Rodriguez',
      role: 'Lead Developer',
      image: 'https://ui-avatars.com/api/?name=Mike+Rodriguez&background=10b981&color=fff&size=200',
      description: 'Full-stack developer focused on creating seamless user experiences.'
    }
  ];

  const faqs = [
    {
      question: 'Is the platform free to use?',
      answer: 'Yes! Our platform is completely free for all users. We believe that career guidance and interview preparation resources should be accessible to everyone.'
    },
    {
      question: 'Can I share experiences anonymously?',
      answer: 'Absolutely! We offer anonymous sharing options to protect your privacy while still allowing you to help others with your valuable insights.'
    },
    {
      question: 'How do you ensure the quality of shared experiences?',
      answer: 'We have a community-driven moderation system where users can rate and report content. Our team also reviews flagged content to maintain quality standards.'
    },
    {
      question: 'Can I edit my shared experiences?',
      answer: 'Yes, you can edit your shared experiences at any time from your profile dashboard. This helps keep information current and accurate.'
    },
    {
      question: 'How can I get the most out of the platform?',
      answer: 'Start by browsing experiences for companies you\'re interested in, bookmark helpful content, and consider sharing your own experiences to give back to the community.'
    }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Empowering Your Interview Journey</h1>
          <p>
            We're building the world's largest community-driven platform for sharing 
            and discovering real interview experiences. From your first internship to 
            your dream job, we're here to help you succeed.
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
                Interview preparation shouldn't be a mystery. Every year, thousands of 
                talented individuals miss opportunities simply because they lack access 
                to reliable, detailed information about interview processes.
              </p>
              <p>
                We're changing that by creating a platform where candidates can share 
                their real experiences, detailed insights, and valuable tips with the 
                next generation of job seekers.
              </p>
              <div className="mission-highlights">
                <div className="highlight">
                  <span className="highlight-icon">🎯</span>
                  <span>Democratize interview preparation</span>
                </div>
                <div className="highlight">
                  <span className="highlight-icon">🤝</span>
                  <span>Build a supportive community</span>
                </div>
                <div className="highlight">
                  <span className="highlight-icon">📈</span>
                  <span>Increase success rates</span>
                </div>
              </div>
            </div>
            <div className="mission-stats">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <span className="stat-number">{stat.number}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
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
                <h3>Explore Experiences</h3>
                <p>Browse through thousands of detailed interview experiences from various companies and roles.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Learn & Prepare</h3>
                <p>Study the questions, tips, and strategies shared by successful candidates.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Share Your Journey</h3>
                <p>After your interviews, share your experience to help the next generation of candidates.</p>
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
            We're a passionate team of developers, designers, and career experts 
            dedicated to making interview preparation accessible to everyone.
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
          <h2>Ready to Start Your Journey?</h2>
          <p>
            Join thousands of candidates who have successfully prepared for their 
            interviews using our platform. Your dream job is just one great 
            interview away!
          </p>
          <div className="cta-buttons">
            <Link to="/register" className="cta-btn primary large">
              Join Our Community
            </Link>
            <Link to="/experiences" className="cta-btn secondary large">
              Browse Experiences
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
                We'd love to hear from you!
              </p>
              <div className="contact-methods">
                <div className="contact-method">
                  <span className="method-icon">📧</span>
                  <span>hello@interviewexperience.com</span>
                </div>
                <div className="contact-method">
                  <span className="method-icon">💬</span>
                  <span>Live chat support available</span>
                </div>
                <div className="contact-method">
                  <span className="method-icon">🐦</span>
                  <span>@InterviewExp on Twitter</span>
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
