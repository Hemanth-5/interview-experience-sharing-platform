import { React } from 'react';

// Company logo utility using free logo services
const LOGO_SERVICES = {
  // Clearbit Logo API (free tier)
  clearbit: (company) => `https://logo.clearbit.com/${company}.com`,
  
  // Logo.dev (free)
  logodev: (company) => `https://img.logo.dev/${company}.com?token=pk_X-1ZO13GSgeOoUrIuJ6GMQ`,
  
  // Favicone (free)
  favicone: (company) => `https://favicone.com/${company}.com?s=128`,
  
  // Unavatar (free)
  unavatar: (company) => `https://unavatar.io/${company}.com`,
};

/**
 * Clean company name for logo URL
 * @param {string} companyName - Raw company name
 * @returns {string} Cleaned company name for URL
 */
export const cleanCompanyName = (companyName) => {
  if (!companyName) return '';
  
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '') // Remove spaces
    .replace(/pvtltd|ltd|inc|corp|corporation|company|co|technologies|tech|solutions|systems|services/g, '') // Remove common suffixes
    .trim();
};

/**
 * Get company logo URL with fallback
 * @param {string} companyName - Company name
 * @param {string} service - Logo service to use (default: 'clearbit')
 * @returns {string} Logo URL
 */
export const getCompanyLogo = (companyName, service = 'clearbit') => {
  if (!companyName) return null;
  
  const cleanName = cleanCompanyName(companyName);
  if (!cleanName) return null;
  
  const logoService = LOGO_SERVICES[service];
  if (!logoService) return null;
  
  return logoService(cleanName);
};

/**
 * Get multiple logo URLs for fallback
 * @param {string} companyName - Company name
 * @returns {Array} Array of logo URLs for fallback
 */
export const getCompanyLogoWithFallback = (companyName) => {
  if (!companyName) return [];
  
  const cleanName = cleanCompanyName(companyName);
  if (!cleanName) return [];
  
  return [
    LOGO_SERVICES.clearbit(cleanName),
    LOGO_SERVICES.unavatar(cleanName),
    LOGO_SERVICES.favicone(cleanName),
  ];
};

/**
 * Create a clean placeholder logo with company initials
 * @param {string} companyName - Company name
 * @param {number} size - Size of the logo (default: 40)
 * @returns {string} Data URL for SVG logo with initials
 */
export const createCompanyPlaceholder = (companyName, size = 40) => {
  if (!companyName) return createDefaultPlaceholder(size);
  
  const initials = companyName
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
  
  // Color palette for consistent company colors
  const colors = [
    '#4F46E5', // Indigo
    '#059669', // Emerald
    '#DC2626', // Red
    '#7C3AED', // Violet
    '#EA580C', // Orange
    '#0891B2', // Cyan
    '#BE185D', // Pink
    '#65A30D', // Lime
    '#1F2937', // Gray
    '#B91C1C'  // Red variant
  ];
  
  // Generate consistent color based on company name
  const colorIndex = companyName.split('').reduce((acc, char, index) => {
    return acc + char.charCodeAt(0) * (index + 1);
  }, 0) % colors.length;
  
  const backgroundColor = colors[colorIndex];
  const fontSize = Math.max(size * 0.35, 12);
  const borderRadius = Math.max(size * 0.2, 6);
  
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad${colorIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${backgroundColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${adjustBrightness(backgroundColor, -20)};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${borderRadius}" fill="url(#grad${colorIndex})" stroke="#ffffff" stroke-width="1"/>
      <text x="${size/2}" y="${size/2 + fontSize/3}" text-anchor="middle" fill="white" 
            font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" 
            font-size="${fontSize}" font-weight="600" letter-spacing="0.5px">
        ${initials}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Create a default placeholder when no company name is provided
 * @param {number} size - Size of the logo
 * @returns {string} Data URL for default SVG
 */
export const createDefaultPlaceholder = (size = 40) => {
  const borderRadius = Math.max(size * 0.2, 6);
  
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="defaultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#94A3B8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#64748B;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${borderRadius}" fill="url(#defaultGrad)" stroke="#ffffff" stroke-width="1"/>
      <circle cx="${size/2}" cy="${size/2 - 3}" r="${size * 0.15}" fill="white" opacity="0.8"/>
      <path d="M ${size * 0.3} ${size * 0.7} Q ${size/2} ${size * 0.75} ${size * 0.7} ${size * 0.7}" 
            stroke="white" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.8"/>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Adjust brightness of a hex color
 * @param {string} hex - Hex color code
 * @param {number} percent - Percentage to adjust (-100 to 100)
 * @returns {string} Adjusted hex color
 */
const adjustBrightness = (hex, percent) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return '#' + (0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)).toString(16).slice(1);
};

/**
 * React hook for loading company logo with fallback
 * @param {string} companyName - Company name
 * @returns {Object} { logoUrl, isLoading, error }
 */
export const useCompanyLogo = (companyName) => {
  const [logoUrl, setLogoUrl] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  React.useEffect(() => {
    if (!companyName) {
      setLogoUrl(null);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    const fallbackUrls = getCompanyLogoWithFallback(companyName);
    let currentIndex = 0;
    
    const tryNextLogo = () => {
      if (currentIndex >= fallbackUrls.length) {
        // All failed, use placeholder
        setLogoUrl(createCompanyPlaceholder(companyName));
        setIsLoading(false);
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        setLogoUrl(fallbackUrls[currentIndex]);
        setIsLoading(false);
      };
      img.onerror = () => {
        currentIndex++;
        tryNextLogo();
      };
      img.src = fallbackUrls[currentIndex];
    };
    
    tryNextLogo();
  }, [companyName]);
  
  return { logoUrl, isLoading, error };
};
