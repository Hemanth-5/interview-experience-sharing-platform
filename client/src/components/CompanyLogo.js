import { createCompanyPlaceholder, createDefaultPlaceholder } from '../utils/companyLogo';

const CompanyLogo = ({ companyName, size = 40, className = '' }) => {
  // For now, we'll just use placeholder SVGs
  // Later this can be updated to fetch real logos with fallback to placeholder
  
  const logoUrl = companyName ? 
    createCompanyPlaceholder(companyName, size) : 
    createDefaultPlaceholder(size);

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
    />
  );
};

export default CompanyLogo;
