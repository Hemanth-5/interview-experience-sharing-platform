// Utility function to generate SVG avatar with user's first letter
export const generateAvatarSVG = (name, size = 40) => {
  if (!name) return null;
  
  // Extract the first letter after the roll number
  // Format: "22Z225 - HEMANTHKUMAR V" -> "H"
  const nameParts = name.split(' - ');
  const actualName = nameParts.length > 1 ? nameParts[1] : name;
  const firstLetter = actualName.charAt(0).toUpperCase();
  
  // Generate a consistent color based on the letter
  const colors = [
    '#1e40af', '#059669', '#dc2626', '#7c3aed', '#ea580c',
    '#0891b2', '#be185d', '#4338ca', '#16a34a', '#ca8a04'
  ];
  const colorIndex = firstLetter.charCodeAt(0) % colors.length;
  const backgroundColor = colors[colorIndex];
  
  // Create SVG string
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${backgroundColor}"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-family="Inter, sans-serif" font-size="${size * 0.4}" font-weight="600">
        ${firstLetter}
      </text>
    </svg>
  `;
  
  // Convert SVG to data URL
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Extract user's actual name from the format "22Z225 - HEMANTHKUMAR V"
export const extractUserName = (fullName) => {
  if (!fullName) return '';
  
  const nameParts = fullName.split(' - ');
  return nameParts.length > 1 ? nameParts[1] : fullName;
};

// Extract user's roll number from the format "22Z225 - HEMANTHKUMAR V"
export const extractRollNumber = (fullName) => {
  if (!fullName) return '';
  
  const nameParts = fullName.split(' - ');
  return nameParts.length > 1 ? nameParts[0] : '';
};
