/**
 * Utility functions for device detection
 */
import { useState, useEffect } from 'react';

/**
 * React hook for detecting mobile devices
 * @returns {boolean} True if mobile device
 */
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      // Check screen width
      const isSmallScreen = window.innerWidth < 1024; // lg breakpoint
      
      // Check user agent for mobile devices
      const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      
      // Check for touch capability
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Consider mobile if small screen OR (mobile user agent AND touch device)
      setIsMobile(isSmallScreen || (isMobileUserAgent && isTouchDevice));
    };

    // Check on mount
    checkIsMobile();

    // Check on resize
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

/**
 * React hook for checking if desktop is required
 * @returns {boolean} True if current device should use desktop-only features
 */
export const useIsDesktopRequired = () => {
  const isMobile = useIsMobile();
  return isMobile;
};

/**
 * Detects if the user is on a mobile device
 * @returns {boolean} True if mobile device
 */
export const isMobileDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'android', 'webos', 'iphone', 'ipad', 'ipod', 
    'blackberry', 'windows phone', 'mobile'
  ];
  
  // Check user agent
  const isMobileUA = mobileKeywords.some(keyword => 
    userAgent.includes(keyword)
  );
  
  // Check screen width (fallback)
  const isSmallScreen = window.innerWidth <= 768;
  
  // Check touch capability
  const isTouchDevice = 'ontouchstart' in window || 
    navigator.maxTouchPoints > 0;
  
  return isMobileUA || (isSmallScreen && isTouchDevice);
};

/**
 * Gets the current viewport width
 * @returns {number} Viewport width in pixels
 */
export const getViewportWidth = () => {
  return Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
};

/**
 * Checks if user has previously dismissed the desktop mode prompt
 * @returns {boolean} True if prompt was dismissed
 */
export const hasDesktopModePromptBeenDismissed = () => {
  return localStorage.getItem('desktopModePromptDismissed') === 'true';
};

/**
 * Marks the desktop mode prompt as dismissed
 */
export const dismissDesktopModePrompt = () => {
  localStorage.setItem('desktopModePromptDismissed', 'true');
};

/**
 * Resets the desktop mode prompt (for testing purposes)
 */
export const resetDesktopModePrompt = () => {
  localStorage.removeItem('desktopModePromptDismissed');
};
