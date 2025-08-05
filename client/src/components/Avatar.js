import { useState, useEffect } from 'react';
import { generateAvatarSVG, extractUserName } from '../utils/avatar';

const Avatar = ({ 
  user, 
  size = 40, 
  className = '',
  showFallback = true 
}) => {
  const [avatarError, setAvatarError] = useState(false);
  
  // Reset error state when user or avatar changes
  useEffect(() => {
    setAvatarError(false);
  }, [user?.avatar, user?.name]);

  const handleAvatarError = () => {
    setAvatarError(true);
  };

  // Generate fallback avatar
  const fallbackAvatar = user?.name && showFallback ? generateAvatarSVG(user.name, size) : null;
  const displayName = user?.name ? extractUserName(user.name) : 'User';
  
  // Determine which avatar to show
  const avatarSrc = !avatarError && user?.avatar ? user.avatar : fallbackAvatar;

  if (!avatarSrc) {
    // Ultimate fallback - a simple colored circle with "?"
    const fallbackColor = '#64748b';
    const fallbackSVG = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${fallbackColor}"/>
        <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-family="Inter, sans-serif" font-size="${size * 0.4}" font-weight="600">
          ?
        </text>
      </svg>
    `;
    const ultimateFallback = `data:image/svg+xml;base64,${btoa(fallbackSVG)}`;
    
    return (
      <img
        src={ultimateFallback}
        alt={displayName}
        className={`avatar ${className}`}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover'
        }}
      />
    );
  }

  return (
    <img
      src={avatarSrc}
      alt={displayName}
      className={`avatar ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover'
      }}
      onError={handleAvatarError}
    />
  );
};

export default Avatar;
