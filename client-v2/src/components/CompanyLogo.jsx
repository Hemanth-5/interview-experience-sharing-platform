import React, { useState, useCallback, useMemo } from 'react';
import { Building } from 'lucide-react';
import { createCompanyPlaceholder, createDefaultPlaceholder } from '../utils/companyLogo';

/**
 * CompanyLogo component - Displays company logos with intelligent fallbacks
 * @param {Object} props - Component props
 * @param {string} props.companyName - Name of the company
 * @param {string} props.companyLogo - URL of the company logo
 * @param {number} props.size - Size of the logo in pixels (default: 40)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.useFallback - Whether to use fallback placeholders (default: true)
 * @param {function} props.onLoad - Callback when image loads successfully
 * @param {function} props.onError - Callback when image fails to load
 */
const CompanyLogo = ({ 
  companyName, 
  companyLogo, 
  size = 40, 
  className = '', 
  useFallback = true,
  onLoad,
  onError 
}) => {
  const [imageState, setImageState] = useState('loading');
  const [currentSrc, setCurrentSrc] = useState('');

  // Memoize the initial logo URL to prevent unnecessary recalculations
  const initialLogoUrl = useMemo(() => {
    return companyLogo || (
      useFallback && companyName ? 
        createCompanyPlaceholder(companyName, size) : 
        createDefaultPlaceholder(size)
    );
  }, [companyLogo, companyName, size, useFallback]);

  // Set initial src when component mounts or props change
  React.useEffect(() => {
    setCurrentSrc(initialLogoUrl);
    setImageState('loading');
  }, [initialLogoUrl]);

  const handleImageLoad = useCallback((e) => {
    setImageState('loaded');
    onLoad?.(e);
  }, [onLoad]);

  const handleImageError = useCallback((e) => {
    setImageState('error');
    
    // If database logo fails to load, fallback to placeholder
    if (companyLogo && useFallback) {
      const fallbackSrc = companyName ? 
        createCompanyPlaceholder(companyName, size) : 
        createDefaultPlaceholder(size);
      
      setCurrentSrc(fallbackSrc);
      setImageState('loading');
    }
    
    onError?.(e);
  }, [companyLogo, companyName, size, useFallback, onError]);

  // Calculate responsive border radius
  const borderRadius = Math.max(size * 0.2, 6);

  return (
    <div 
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
    >
      {companyLogo ? (
        <>
          <img
            src={currentSrc}
            alt={companyName ? `${companyName} logo` : 'Company logo'}
            className={`
              w-full h-full object-contain transition-opacity duration-200 rounded-lg bg-white
              ${imageState === 'loading' ? 'opacity-0' : 'opacity-100'}
              ${imageState === 'error' ? 'opacity-75' : ''}
            `}
            style={{ 
              borderRadius,
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            decoding="async"
          />
          
          {/* Loading state */}
          {imageState === 'loading' && (
            <div 
              className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center"
              style={{ borderRadius }}
            >
              <div className="w-1/3 h-1/3 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          )}
          
          {/* Error state indicator */}
          {imageState === 'error' && !useFallback && (
            <div 
              className="absolute inset-0 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 flex items-center justify-center"
              style={{ borderRadius }}
            >
              <span className="text-red-500 dark:text-red-400 text-xs font-medium">!</span>
            </div>
          )}
        </>
      ) : (
        <div 
          className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg"
          style={{ borderRadius }}
        >
          <Building className="text-blue-600 dark:text-blue-400" style={{ width: size * 0.6, height: size * 0.6 }} />
        </div>
      )}
    </div>
  );
};

export default CompanyLogo;
