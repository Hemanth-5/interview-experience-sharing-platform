import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PSGNotification from '../components/PSGNotification';
import { useAuth } from '../contexts/AuthContext';
import { 
  Mail, 
  MessageCircle, 
  Target, 
  Users, 
  Star, 
  BookmarkPlus, 
  TrendingUp,
  Search,
  FileText,
  BarChart3,
  ArrowRight,
  CheckCircle,
  ExternalLink,
  Github,
  Twitter,
  Linkedin
} from 'lucide-react';

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
      icon: FileText,
      title: 'Share PSG Tech Experiences',
      description: 'Share detailed PSG Tech interview experiences with round-by-round breakdowns, questions, and valuable tips.'
    },
    {
      icon: Search,
      title: 'Search PSG Tech Interviews',
      description: 'Find PSG Tech interview experiences by department, role, or specific topics to prepare effectively.'
    },
    {
      icon: Users,
      title: 'PSG Tech Community',
      description: 'Learn from PSG Tech students and alumni across different departments and placement experiences.'
    },
    {
      icon: Star,
      title: 'Rating System',
      description: 'Rate and review PSG Tech interview experiences to help fellow students identify the most helpful content.'
    },
    {
      icon: BookmarkPlus,
      title: 'Bookmark & Save',
      description: 'Save interesting PSG Tech placement experiences and build your personal preparation library.'
    },
    {
      icon: BarChart3,
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

  const steps = [
    {
      number: 1,
      title: 'Explore PSG Tech Experiences',
      description: 'Browse through hundreds of detailed placement experiences from PSG Tech students across various companies and departments.'
    },
    {
      number: 2,
      title: 'Learn & Prepare',
      description: 'Study the questions, tips, and strategies shared by successful PSG Tech alumni and seniors.'
    },
    {
      number: 3,
      title: 'Share Your PSG Tech Journey',
      description: 'After your placements, share your experience to help the next batch of PSG Tech students.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/30 transition-colors duration-300">
      <PSGNotification
        open={notification.open}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ ...notification, open: false })}
      />
      
      {/* Header */}
      {/* <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.history.back()} 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Back to Home
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                PSG Tech Community
              </span>
            </div>
          </div>
        </div>
      </div> */}

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Empowering PSG Tech Students
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent mb-4 sm:mb-6">
              Your Placement Journey Starts Here
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4 sm:px-0">
              We're building PSG Tech's largest community-driven platform for sharing 
              and discovering real placement and interview experiences. From internships to 
              dream companies, we're here to help PSG Tech students succeed.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <Link
                to="/experiences"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-6 sm:px-8 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
              >
                Explore Experiences
                <Search className="w-4 h-4 ml-2" />
              </Link>
              <Link
                to="/create"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-10 px-6 sm:px-8 border-2 hover:bg-secondary/80"
              >
                Share Your Story
                <FileText className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl"></div>
      </section>

      {/* Mission Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="bg-card text-card-foreground flex flex-col gap-4 sm:gap-6 rounded-xl border max-w-4xl mx-auto border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
            <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-4 sm:px-6 pt-4 sm:pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 text-center pb-6 sm:pb-8">
              <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs sm:text-sm font-medium mb-3 sm:mb-4 w-fit mx-auto">
                <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Our Mission
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Democratizing Placement Success</h2>
            </div>
            <div className="px-4 sm:px-6 [&:last-child]:pb-4 sm:[&:last-child]:pb-6 space-y-6 sm:space-y-8">
              <div className="text-center space-y-4 sm:space-y-6">
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  Placement preparation at PSG Tech shouldn't be a mystery. Every year, thousands of 
                  talented PSG Tech students miss opportunities simply because they lack access 
                  to reliable, detailed information about company interview processes.
                </p>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  We're changing that by creating a platform where PSG Tech students and alumni can share 
                  their real placement experiences, detailed insights, and valuable tips with the 
                  next batch of PSG Tech students.
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
                <div className="text-center p-4 sm:p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/10 border border-blue-200 dark:border-blue-800">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">Democratize Preparation</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Making quality placement guidance accessible to all PSG Tech students</p>
                </div>
                
                <div className="text-center p-4 sm:p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/10 border border-green-200 dark:border-green-800">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">Build Community</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Fostering a supportive PSG Tech alumni and student network</p>
                </div>
                
                <div className="text-center p-4 sm:p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/10 border border-purple-200 dark:border-purple-800">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">Increase Success</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Improving PSG Tech placement success rates through shared knowledge</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Why Choose Our Platform?</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
              Discover the features that make our platform the go-to resource for PSG Tech students
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-card text-card-foreground flex flex-col gap-4 sm:gap-6 rounded-xl border border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-card/95 backdrop-blur-sm">
                  <div className="px-4 sm:px-6 [&:last-child]:pb-4 sm:[&:last-child]:pb-6 p-4 sm:p-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2 text-sm sm:text-base">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">How It Works</h2>
            <p className="text-base sm:text-lg text-muted-foreground">Simple steps to success</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6 sm:space-y-8">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start space-x-4 sm:space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground">
                      <ArrowRight className="w-full h-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Meet Our Team</h2>
            <p className="text-base sm:text-lg text-muted-foreground">The passionate individuals behind this platform</p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="grid gap-6 sm:gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-card text-card-foreground flex flex-col gap-4 sm:gap-6 rounded-xl border border-0 shadow-lg bg-card/95 backdrop-blur-sm">
                  <div className="px-4 sm:px-6 [&:last-child]:pb-4 sm:[&:last-child]:pb-6 p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-4 ring-blue-100 dark:ring-blue-900/30">
                        <img 
                          src={member.image} 
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-center sm:text-left">
                        <h3 className="text-lg sm:text-xl font-semibold mb-1">{member.name}</h3>
                        <p className="text-blue-600 dark:text-blue-400 font-medium mb-2 text-sm sm:text-base">{member.role}</p>
                        <p className="text-muted-foreground text-sm sm:text-base">{member.description}</p>
                        
                        <div className="flex items-center justify-center sm:justify-start space-x-3 sm:space-x-4 mt-4 sm:mt-6">
                          <a 
                            href="https://github.com/Hemanth-5" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-md"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                          <a 
                            href="https://www.linkedin.com/in/hemanthkumar-v-2a6321224/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-md"
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                          <a
                            href="https://mail.google.com/mail/?view=cm&fs=1&to=hemanthlaxvel@gmail.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-md"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Frequently Asked Questions</h2>
            <p className="text-base sm:text-lg text-muted-foreground">Everything you need to know</p>
          </div>
          
          <div className="max-w-4xl mx-auto grid gap-4 sm:gap-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-card text-card-foreground flex flex-col gap-4 sm:gap-6 rounded-xl border border-0 shadow-lg bg-card/95 backdrop-blur-sm">
                <div className="px-4 sm:px-6 [&:last-child]:pb-4 sm:[&:last-child]:pb-6 p-4 sm:p-6">
                  <h3 className="font-semibold mb-2 sm:mb-3 text-blue-600 dark:text-blue-400 text-sm sm:text-base">{faq.question}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Contact Info */}
            <div className="bg-card text-card-foreground flex flex-col gap-4 sm:gap-6 rounded-xl border border-0 shadow-lg bg-card/95 backdrop-blur-sm">
              <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-4 sm:px-6 pt-4 sm:pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Get in Touch</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Have questions, suggestions, or just want to say hello? 
                  The PSG Tech placement team would love to hear from you!
                </p>
              </div>
              <div className="px-4 sm:px-6 [&:last-child]:pb-4 sm:[&:last-child]:pb-6 space-y-4 sm:space-y-6">
                <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/10">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">Email Us</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">placement@psgtech.ac.in</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/10">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">Visit Office</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">PSG Tech Placement Office</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-card text-card-foreground flex flex-col gap-4 sm:gap-6 rounded-xl border border-0 shadow-lg bg-card/95 backdrop-blur-sm" ref={contactFormRef}>
              <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-4 sm:px-6 pt-4 sm:pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
                <h3 className="text-xl sm:text-2xl font-bold">Send us a Message</h3>
              </div>
              <div className="px-4 sm:px-6 [&:last-child]:pb-4 sm:[&:last-child]:pb-6">
                {user ? (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Subject (Optional)"
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 bg-input-background"
                      />
                    </div>
                    
                    <div>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Your Message"
                        rows={4}
                        required
                        className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 bg-input-background sm:min-h-[120px]"
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                    >
                      {isSubmitting ? 'Opening Gmail...' : 'Send Message'}
                      <Mail className="w-4 h-4 ml-2" />
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-6 sm:py-8 space-y-3 sm:space-y-4">
                    <p className="text-muted-foreground text-sm sm:text-base">Please log in to send us a message.</p>
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                    >
                      Go to Login
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
