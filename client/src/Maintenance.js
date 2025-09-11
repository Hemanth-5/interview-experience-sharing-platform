import React, { useEffect } from 'react';

const Maintenance = () => {
  useEffect(() => {
    // Set the document title
    document.title = 'Temporarily Offline - Interview Experience Platform';
    
    // Add Google Fonts
    const link1 = document.createElement('link');
    link1.rel = 'preconnect';
    link1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(link1);
    
    const link2 = document.createElement('link');
    link2.rel = 'preconnect';
    link2.href = 'https://fonts.gstatic.com';
    link2.crossOrigin = 'anonymous';
    document.head.appendChild(link2);
    
    const link3 = document.createElement('link');
    link3.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap';
    link3.rel = 'stylesheet';
    document.head.appendChild(link3);
    
    // Apply body styles
    document.body.style.fontFamily = "'Inter', sans-serif";
    document.body.style.backgroundColor = '#1a1a2e';
    document.body.style.color = '#e0e0e0';
    document.body.style.display = 'flex';
    document.body.style.justifyContent = 'center';
    document.body.style.alignItems = 'center';
    document.body.style.minHeight = '100vh';
    document.body.style.margin = '0';
    document.body.style.textAlign = 'center';
    document.body.style.padding = '20px';
    document.body.style.boxSizing = 'border-box';
    document.body.style.opacity = '0';
    document.body.style.animation = 'mp-fadeIn 0.8s 0.2s ease-out forwards';
    
    // Add CSS keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes mp-fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    
    // Cleanup function
    return () => {
      document.head.removeChild(link1);
      document.head.removeChild(link2);
      document.head.removeChild(link3);
      document.head.removeChild(style);
    };
  }, []);

  const containerStyle = {
    padding: '40px',
    backgroundColor: '#21213e',
    borderRadius: '12px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5)',
    maxWidth: '600px',
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  };

  const headingStyle = {
    color: '#0056b3',
    fontSize: '2.5em',
    marginBottom: '15px',
    fontWeight: '700'
  };

  const textStyle = {
    margin: '18px 0',
    lineHeight: '1.7',
    fontSize: '1.05em',
    color: '#e0e0e0',
    fontWeight: '400'
  };

  const highlightStyle = {
    color: '#0056b3',
    fontWeight: '600'
  };

  const footerStyle = {
    backgroundColor: '#007bff',
    padding: '20px 25px',
    borderRadius: '8px',
    marginTop: '35px',
    fontWeight: '600',
    color: '#ffffff',
    fontSize: '1.1em',
    boxShadow: '0 4px 15px rgba(0, 123, 255, 0.4)'
  };

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>Temporarily Offline</h1>
      
      <p style={textStyle}>
        We're currently undergoing a brief security review by Google's Safe Browsing system. 
        This is a temporary measure due to the site's newness and its specific login requirement for{' '}
        <span style={highlightStyle}>@psgtech.ac.in</span> users. Rest assured, our platform is perfectly safe.
      </p>
      
      <p style={textStyle}>
        We expect to be fully back online and accessible once the review is complete. 
        We apologize for any inconvenience!
      </p>
      
      <div style={footerStyle}>
        Thank you for your patience!
      </div>
    </div>
  );
};

export default Maintenance;