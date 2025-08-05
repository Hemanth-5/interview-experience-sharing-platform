import { createCompanyPlaceholder, createDefaultPlaceholder } from '../utils/companyLogo';

const CompanyLogo = ({ 
  companyName, 
  companyLogo, 
  size = 40, 
  className = '', 
  useFallback = true 
}) => {
  // Priority order:
  // 1. Use companyLogo from database if available
  // 2. Use placeholder based on company name if useFallback is true
  // 3. Use default placeholder
  
  const logoUrl = companyLogo || (
    useFallback && companyName ? 
      createCompanyPlaceholder(companyName, size) : 
      createDefaultPlaceholder(size)
  );

  const handleImageError = (e) => {
    // If database logo fails to load, fallback to placeholder
    if (companyLogo && useFallback) {
      e.target.src = companyName ? 
        createCompanyPlaceholder(companyName, size) : 
        createDefaultPlaceholder(size);
    }
  };

  return (
    <img
      src={logoUrl}
      alt={companyName ? `${companyName} logo` : 'Company logo'}
      className={`company-logo ${className}`}
      style={{ 
        width: size, 
        height: size,
        borderRadius: Math.max(size * 0.2, 6),
        objectFit: 'contain',
        backgroundColor: 'transparent'
      }}
      onError={handleImageError}
    />
  );
};

export default CompanyLogo;
