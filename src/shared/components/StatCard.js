import React from 'react';
import Icon from './Icon';

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  trend = 'neutral',
  className = '',
  onClick
}) => {
  const trendColors = {
    up: 'text-accent',
    down: 'text-error',
    neutral: 'text-secondary'
  };

  const trendIcons = {
    up: 'trending',
    down: 'trending',
    neutral: 'trending'
  };

  return (
    <div 
      className={`card ${className} ${onClick ? 'transition-all duration-200' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm text-secondary mb-1">{title}</div>
          <div className="text-2xl font-bold text-primary mb-2">{value}</div>
          {change && (
            <div className={`flex items-center gap-1 text-sm ${trendColors[trend]}`}>
              <Icon name={trendIcons[trend]} size={12} />
              <span>{change}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-2 bg-glass rounded-lg">
            <Icon name={icon} size={20} className="text-accent" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
