import React, { useState, useCallback } from 'react';
import UnifiedSidebar from './UnifiedSidebar';

const MenuIcon = ({ size = 24 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const ThreeColumnLayout = ({ 
  children, 
  matches = [], 
  title = 'Dashboard',
  subtitle = 'Live matches, insights and real-time betting data',
  tabs = [],
  activeTab = '',
  onTabChange,
  className = ''
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handlePredictionClick = useCallback((prediction) => {
    console.log('Prediction clicked:', prediction);
    // Navigate to match detail or show prediction modal
  }, []);

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <UnifiedSidebar
        position="left"
        variant="filter"
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
      />

      {/* Main Content Area */}
      <main className={`main-content ${className}`}>
        {/* Mobile Header with Sidebar Toggle */}
        <div className="md:hidden flex items-center justify-between p-4 bg-gray-900/50 backdrop-blur-lg rounded-lg mb-4">
          <button
            onClick={handleSidebarToggle}
            className="text-yellow-400 hover:text-yellow-300 transition-colors"
            aria-label="Open filters"
          >
            <MenuIcon />
          </button>
          <h1 className="text-lg font-bold text-yellow-400">{title}</h1>
          <div></div> {/* Spacer for centering */}
        </div>

        {/* Main Header */}
        <div className="main-header">
          <div>
            <h1 className="main-title">{title}</h1>
            <p className="main-subtitle">{subtitle}</p>
          </div>
          
          <div className="text-sm text-gray-400">
            {matches.length} matches available
          </div>
        </div>

        {/* Content Tabs */}
        {tabs.length > 0 && (
          <div className="content-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabChange && onTabChange(tab.id)}
                className={`content-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.id 
                      ? 'bg-black/20 text-black' 
                      : 'bg-yellow-500 text-black'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="content-area">
          {children}
        </div>
      </main>

      {/* Right Sidebar - Hidden on smaller screens */}
      <UnifiedSidebar
        position="right" 
        variant="insights"
        isOpen={true}
        onClose={() => {}}
      />
    </div>
  );
};

export default ThreeColumnLayout;