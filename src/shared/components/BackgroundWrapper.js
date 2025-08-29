// ===============================================
// BACKGROUND WRAPPER COMPONENT
// Handles custom background image for the app
// ===============================================

import React from 'react';

const BackgroundWrapper = ({ children, className = '' }) => {
  const backgroundStyle = {
    background: `
      linear-gradient(135deg, 
        rgba(0, 0, 0, 0.85) 0%, 
        rgba(0, 0, 0, 0.75) 30%, 
        rgba(0, 0, 0, 0.85) 70%, 
        rgba(255, 215, 0, 0.15) 100%
      ),
      url('/background-wall.jpeg')
    `,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    minHeight: '100vh',
    width: '100%'
  };

  return (
    <div 
      className={`${className}`}
      style={backgroundStyle}
    >
      {children}
    </div>
  );
};

export default BackgroundWrapper;