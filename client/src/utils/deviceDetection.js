/**
 * Utility functions for device detection
 */

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
