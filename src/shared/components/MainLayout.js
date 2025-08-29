import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import MobileNavigation from './MobileNavigation';
import { FilterProvider } from '../context';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Close sidebar when switching to desktop
      if (!mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };


  return (
    <FilterProvider>
      <div className="app-container">
        <Header 
          onToggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />
        
        <main 
          className="main-content" 
          id="main-content"
          role="main" 
          aria-label="Main content"
        >
          <Outlet />
        </main>
        
        {isMobile && <MobileNavigation />}
      </div>
    </FilterProvider>
  );
};

export default MainLayout;
