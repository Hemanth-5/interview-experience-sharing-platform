import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Lightbulb, 
  Trophy, 
  BarChart3, 
  FileText,
  Shield,
  CheckCircle,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  useEffect(() => {
    // Check for error in URL params
    const urlParams = new URLSearchParams(location.search);
    const errorParam = urlParams.get('error');
    
    if (errorParam === 'domain_restricted') {
      setError('Access restricted to PSG Tech students only. Please use your PSG Tech email address (@psgtech.ac.in).');
    } else if (errorParam === 'auth_failed') {
      setError('Authentication failed. Please try again.');
    } else if (errorParam === 'login_failed') {
      setError('Login failed. Please try again.');
    }
  }, [location.search]);

  const handleGoogleLogin = () => {
    setError(''); // Clear any existing errors
    login(); // Use the login function from auth context
  };

  const benefits = [
    {
      icon: FileText,
      title: 'Share Interview Experiences',
      description: 'Document and share your placement journey with fellow PSG Tech students'
    },
    {
      icon: Search,
      title: 'Browse Real Experiences',
      description: 'Access thousands of authentic interview experiences from your seniors'
    },
    {
      icon: Lightbulb,
      title: 'Get Expert Tips',
      description: 'Learn from successful candidates and improve your interview skills'
    },
    {
      icon: Trophy,
      title: 'Build Your Reputation',
      description: 'Help others and establish yourself as a valuable community member'
    },
    {
      icon: BarChart3,
      title: 'Access Analytics',
      description: 'View company-specific trends and placement statistics'
    }
  ];

  return (
    <div className="min-h-screen dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Left Side - Welcome Content */}
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center lg:text-left">
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4 sm:mb-6">
                Welcome to PSG Tech Interview Hub
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 px-4 lg:px-0">
                Connect with fellow PSG Tech students and accelerate your placement journey through shared experiences and insights.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="bg-gray/70 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm mb-1">{benefit.title}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-300">{benefit.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
          {/* Right Side - Login Card */}
          <div className="bg-gray/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Secure Login</h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Access your PSG Tech community account</p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

            <button 
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-center space-x-2 sm:space-x-3 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300 shadow-sm hover:shadow-md group"
              onClick={handleGoogleLogin}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-medium text-sm sm:text-base text-gray-700 dark:text-gray-200">Continue with Google</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
            </button>

            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                By signing in, you agree to our{' '}
                <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">terms of service</span>
                {' '}and{' '}
                <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">privacy policy</span>.
              </p>
            </div>

            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                <span>Restricted to PSG Tech students only</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
