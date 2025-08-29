import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon';

const MobileNavigation = () => {
  const location = useLocation();

  const navigationItems = [
    { id: 'home', label: 'Home', icon: 'home', path: '/' }
  ];

  return (
    <nav className="mobile-nav">
      <div className="mobile-nav-items">
        {navigationItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`mobile-nav-item ${
              location.pathname === item.path ? 'active' : ''
            }`}
            aria-label={item.label}
          >
            <Icon name={item.icon} className="mobile-nav-icon" />
            <span className="mobile-nav-label">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileNavigation;
