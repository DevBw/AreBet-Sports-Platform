import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';

const Header = ({ onToggleSidebar, sidebarOpen }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'home', path: '/' }
  ];

  return (
    <header className="header" role="banner">
      {/* Skip to main content link for screen readers */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <div className="header-content">
        {/* Brand and Hamburger Menu */}
        <div className="flex items-center gap-4">
          <button 
            className="hamburger md-hidden"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
          </button>
          
          <Link to="/" className="logo">
            <span>AreBet</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="nav-menu mobile-hidden" role="navigation" aria-label="Main navigation">
          {navigationItems.map((item) => (
            <Link 
              key={item.id}
              to={item.path}
              className="nav-link"
              aria-label={`Navigate to ${item.label}`}
            >
              <Icon name={item.icon} className="nav-icon" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="relative">
          <button 
            className="user-profile"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            aria-label="User menu"
            aria-expanded={userMenuOpen}
            aria-haspopup="menu"
          >
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face&auto=format" 
              alt="User avatar" 
              className="user-avatar"
            />
            <Icon name="chevronDown" size={16} aria-hidden="true" />
          </button>
          
          {userMenuOpen && (
            <div 
              className="absolute top-full right-0 mt-2 w-48 bg-card border border-accent rounded-lg shadow-lg z-dropdown animate-fadeIn"
              role="menu"
              aria-label="User menu options"
            >
              <div className="p-4 border-b border-border">
                <div className="font-semibold text-primary">John Doe</div>
                <div className="text-sm text-secondary">john@example.com</div>
              </div>
              <div className="p-2" role="none">
                <Link 
                  to="/profile" 
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-glass transition-all"
                  role="menuitem"
                  aria-label="Go to user profile"
                >
                  <Icon name="user" size={16} aria-hidden="true" />
                  <span>Profile</span>
                </Link>
                <button 
                  className="flex items-center gap-3 p-2 w-full text-left rounded-md hover:bg-glass transition-all"
                  role="menuitem"
                  aria-label="Sign out of account"
                >
                  <Icon name="x" size={16} aria-hidden="true" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </header>
  );
};

export default Header;
