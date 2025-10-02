import { createContext, useContext, useState, useEffect } from 'react';
import { AlertCircle, Chrome } from 'lucide-react';

const BrowserCompatibilityContext = createContext();

export const useBrowserCompatibility = () => {
  const context = useContext(BrowserCompatibilityContext);
  if (!context) {
    throw new Error('useBrowserCompatibility must be used within a BrowserCompatibilityProvider');
  }
  return context;
};

// Browser detection utility
const detectBrowser = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Check for Brave browser specifically
  if (navigator.brave && navigator.brave.isBrave) {
    return 'brave';
  }
  
  // Check for other problematic browsers
  if (userAgent.includes('brave')) {
    return 'brave';
  }
  
  // Allow these browsers (they generally work fine)
  if (userAgent.includes('chrome') && !userAgent.includes('edge') && !userAgent.includes('opr')) {
    return 'chrome';
  } else if (userAgent.includes('firefox')) {
    return 'firefox';
  } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    return 'safari';
  } else if (userAgent.includes('edge')) {
    return 'edge';
  } else {
    return 'unknown';
  }
};

const BrowserWarning = ({ onDismiss }) => {
  const handleUseChrome = () => {
    // Try to open Chrome if installed, otherwise open download page
    const chromeUrl = window.location.href;
    window.open(`googlechrome://${chromeUrl}`, '_self');
    
    // Fallback: if Chrome isn't installed, open download page after a short delay
    setTimeout(() => {
      window.open('https://www.google.com/chrome/', '_blank');
      window.close(); // Close current tab
    }, 1000);
  };

  const handleCloseTab = () => {
    window.close();
    // Fallback for browsers that don't allow window.close()
    document.body.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif; text-align: center;"><div><h2>Please close this tab</h2><p>And open the website in Google Chrome for the best experience.</p></div></div>';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Potential Login Issues
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Your browser may experience authentication problems
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            We've detected you're using a browser that may have login issues. For the best experience and guaranteed compatibility, we recommend using Google Chrome.
          </p>
          <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Chrome className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Chrome provides the most reliable experience
            </span>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleUseChrome}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-center transition-colors"
          >
            Open in Chrome
          </button>
          <button
            onClick={onDismiss}
            className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Continue Here
          </button>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
          Note: You may experience login difficulties with your current browser
        </p>
      </div>
    </div>
  );
};

export const BrowserCompatibilityProvider = ({ children }) => {
  const [showWarning, setShowWarning] = useState(false);
  const [browser, setBrowser] = useState('unknown');

  useEffect(() => {
    const detectedBrowser = detectBrowser();
    setBrowser(detectedBrowser);
    
    // Show warning for browsers known to have login issues
    const problematicBrowsers = ['brave', 'safari'];
    
    if (problematicBrowsers.includes(detectedBrowser)) {
      // Check if user has already dismissed the warning in this session
      const hasDismissed = sessionStorage.getItem('browserWarningDismissed');
      if (!hasDismissed) {
        setShowWarning(true);
      }
    }
  }, []);

  const dismissWarning = () => {
    setShowWarning(false);
    // Remember dismissal for this session
    sessionStorage.setItem('browserWarningDismissed', 'true');
  };

  const value = {
    browser,
    isCompatible: !['brave', 'safari'].includes(browser),
    showWarning,
    dismissWarning
  };

  return (
    <BrowserCompatibilityContext.Provider value={value}>
      {showWarning && <BrowserWarning onDismiss={dismissWarning} />}
      {children}
    </BrowserCompatibilityContext.Provider>
  );
};