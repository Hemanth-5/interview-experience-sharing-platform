import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Search, ArrowLeft, Sparkles, Star, Zap } from 'lucide-react';

// Creative animated 404 illustration - Digital Glitch Effect with Floating Code
const CreativeIllustration = () => {
  const [glitchActive, setGlitchActive] = useState(false);
  const [codeLines, setCodeLines] = useState([]);

  // Generate random code snippets
  const codeSnippets = [
    'if (page.exists) {',
    '  return <Page />',
    '} else {',
    '  throw new Error("404")',
    '}',
    'const page = null;',
    'console.log("Where am I?");',
    'router.navigate("/404");',
    'ERROR: Page not found',
    'undefined is not a function',
  ];

  useEffect(() => {
    // Generate floating code lines
    const lines = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
    }));
    setCodeLines(lines);

    // Random glitch effect
    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div className="relative w-full h-96 flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900/5 to-blue-900/5 dark:from-gray-800/20 dark:to-blue-800/20 rounded-3xl">
      
      {/* Floating code lines */}
      <div className="absolute inset-0">
        {codeLines.map((line) => (
          <div
            key={line.id}
            className="absolute text-xs font-mono text-gray-400/60 dark:text-gray-500/60 whitespace-nowrap animate-pulse"
            style={{
              left: `${line.x}%`,
              top: `${line.y}%`,
              animationDelay: `${line.delay}s`,
              animationDuration: `${line.duration}s`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="animate-bounce" style={{ animationDelay: `${line.delay}s` }}>
              {line.text}
            </div>
          </div>
        ))}
      </div>

      {/* Matrix-style falling characters */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="absolute top-0 text-green-500/40 dark:text-green-400/40 font-mono text-sm animate-pulse"
            style={{
              left: `${(i * 5) % 100}%`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: `${2 + Math.random()}s`,
            }}
          >
            <div className="animate-bounce">
              {Math.random() > 0.5 ? '1' : '0'}
            </div>
          </div>
        ))}
      </div>

      {/* Main 404 with creative glitch effect */}
      <div className="relative z-10 flex flex-col items-center">
        <div 
          className={`relative transition-all duration-200 ${
            glitchActive ? 'animate-pulse' : ''
          }`}
        >
          {/* Multiple layered 404 texts for glitch effect */}
          <div className="relative">
            {/* Main text */}
            <div className="text-[120px] lg:text-[160px] font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 leading-none select-none relative z-10">
              4
              <span className={`inline-block transition-transform duration-200 ${glitchActive ? 'skew-x-12' : ''}`}>
                0
              </span>
              4
            </div>
            
            {/* Glitch layers */}
            <div className={`absolute inset-0 text-[120px] lg:text-[160px] font-black text-red-500/30 leading-none select-none transform transition-all duration-100 ${
              glitchActive ? 'translate-x-1 -translate-y-1' : ''
            }`}>
              404
            </div>
            <div className={`absolute inset-0 text-[120px] lg:text-[160px] font-black text-blue-500/30 leading-none select-none transform transition-all duration-100 ${
              glitchActive ? '-translate-x-1 translate-y-1' : ''
            }`}>
              404
            </div>
            
            {/* Scan lines effect */}
            <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent h-2 animate-pulse ${
              glitchActive ? 'opacity-100' : 'opacity-0'
            }`} style={{ top: '40%' }} />
          </div>
        </div>

        {/* Floating geometric shapes */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Triangles */}
          <div className="absolute top-16 left-8 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400/40 animate-spin" style={{ animationDuration: '4s' }} />
          <div className="absolute top-32 right-12 w-6 h-6 bg-pink-500/30 transform rotate-45 animate-pulse" />
          <div className="absolute bottom-20 left-16 w-8 h-8 border-2 border-purple-500/40 rounded-full animate-bounce" />
          <div className="absolute bottom-32 right-8 w-4 h-8 bg-blue-500/30 animate-pulse" />
          
          {/* Circuit-like lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 400">
            <path
              d="M50,200 Q200,100 350,200 T350,300"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              className="text-blue-500 animate-pulse"
              strokeDasharray="5,5"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="0;10"
                dur="2s"
                repeatCount="indefinite"
              />
            </path>
            <path
              d="M200,50 Q300,200 200,350 T100,350"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              className="text-purple-500 animate-pulse"
              strokeDasharray="3,7"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="0;10"
                dur="3s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        </div>

        {/* Holographic display effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 rounded-2xl blur-xl animate-pulse" />
        
        {/* Terminal cursor blink */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1 font-mono text-green-500 text-sm">
          <span>{'>'}</span>
          <span className="animate-pulse">_</span>
        </div>
      </div>

      {/* Particle system */}
      <div className="absolute inset-0">
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/50 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 2}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

const PageNotFound = () => {
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center justify-center px-4 py-8 transition-all duration-300">
      
      {/* Main content container */}
      <div className="w-full max-w-4xl mx-auto text-center">
        
        {/* Animated illustration */}
        <div className="mb-8">
          <CreativeIllustration />
        </div>

        {/* Content */}
        <div className="space-y-6 mb-12">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
              Oops! Page Not Found
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              The page you're looking for seems to have wandered off into the digital void. 
              Don't worry, it happens to the best of us!
            </p>
          </div>

          {/* Error details */}
          {/* <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-full text-red-700 dark:text-red-400 text-sm font-medium">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            Error 404 - Page Not Found
          </div> */}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleGoBack}
            className="group inline-flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-xl shadow-blue-500/25"
          >
            <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Go Back
          </button>

          <Link
            to="/experiences"
            className="group inline-flex items-center gap-3 px-6 py-3 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Browse Experiences
          </Link>
        </div>

        

      </div>
    </div>
  );
};

export default PageNotFound;