import React, { useState, useEffect } from 'react';
import './DesktopModePrompt.css';
import { 
  isMobileDevice, 
  hasDesktopModePromptBeenDismissed, 
  dismissDesktopModePrompt 
} from '../utils/deviceDetection';

const DesktopModePrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if user is on mobile and hasn't dismissed the prompt
    if (isMobileDevice() && !hasDesktopModePromptBeenDismissed()) {
      // Show prompt after a short delay for better UX
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleSwitchToDesktop = () => {
    // Force desktop viewport
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.content = 'width=1024, initial-scale=0.5, user-scalable=yes';
    }
    
    // Dismiss the prompt
    dismissDesktopModePrompt();
    setShowPrompt(false);
    
    // Optional: Show a brief success message
    alert('Switched to desktop mode! You can zoom to adjust the view.');
  };

  const handleDismiss = () => {
    dismissDesktopModePrompt();
    setShowPrompt(false);
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    // Don't save to localStorage, so it shows again on next visit
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="desktop-mode-prompt-overlay">
      <div className="desktop-mode-prompt">
        <div className="prompt-header">
          <h3>Better Experience Available</h3>
        </div>
        
        <div className="prompt-content">
          <p>
            We've detected you're using a mobile device. For the best experience 
            viewing interview experiences with detailed content, would you like to 
            switch to desktop mode?
          </p>
          
          <div className="prompt-benefits">
            <ul>
              <li>Better readability for long experiences</li>
              <li>Improved layout for detailed content</li>
              <li>Enhanced navigation experience</li>
            </ul>
          </div>
        </div>
        
        <div className="prompt-actions">
          <button 
            className="btn-switch-desktop"
            onClick={handleSwitchToDesktop}
          >
            Switch to Desktop Mode
          </button>
          
          <button 
            className="btn-remind-later"
            onClick={handleRemindLater}
          >
            Remind Me Later
          </button>
          
          <button 
            className="btn-dismiss"
            onClick={handleDismiss}
          >
            Don't Show Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesktopModePrompt;
