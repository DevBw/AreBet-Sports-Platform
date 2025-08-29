import React from 'react';
import PropTypes from 'prop-types';
import Icon from './Icon';

const MatchNavigation = ({ 
  activeFilter, 
  onFilterChange, 
  selectedDate, 
  onDateChange, 
  counts = {} 
}) => {
  const filters = [
    { 
      key: 'live', 
      label: 'Live', 
      icon: 'live', 
      count: counts.live || 0,
      color: 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100'
    },
    { 
      key: 'upcoming', 
      label: 'Upcoming', 
      icon: 'upcoming', 
      count: counts.upcoming || 0,
      color: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100'
    },
    { 
      key: 'finished', 
      label: 'Finished', 
      icon: 'finished', 
      count: counts.finished || 0,
      color: 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100'
    }
  ];

  const getQuickDates = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return [
      { 
        label: 'Yesterday', 
        value: yesterday.toISOString().split('T')[0] 
      },
      { 
        label: 'Today', 
        value: today.toISOString().split('T')[0] 
      },
      { 
        label: 'Tomorrow', 
        value: tomorrow.toISOString().split('T')[0] 
      }
    ];
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm
              ${activeFilter === filter.key 
                ? `${filter.color} shadow-sm` 
                : 'text-slate-600 bg-slate-50 hover:bg-slate-100 hover:shadow-sm'
              }
            `}
          >
            <Icon name={filter.icon} size={14} />
            <span>{filter.label}</span>
            {filter.count > 0 && (
              <span className={`
                px-1.5 py-0.5 text-xs font-bold rounded-full
                ${activeFilter === filter.key 
                  ? 'bg-white text-slate-700 shadow-sm' 
                  : 'bg-slate-200 text-slate-600'
                }
              `}>
                {filter.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Date Selection */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 text-slate-600">
          <Icon name="calendar" size={16} />
          <span className="font-semibold text-sm">Date:</span>
        </div>
        
        {/* Quick Date Buttons */}
        {getQuickDates().map((dateOption) => (
          <button
            key={dateOption.value}
            onClick={() => onDateChange(dateOption.value)}
            className={`
              px-3 py-1.5 rounded text-xs font-semibold transition-all duration-200
              ${selectedDate === dateOption.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:shadow-sm'
              }
            `}
          >
            {dateOption.label}
          </button>
        ))}
        
        {/* Custom Date Picker */}
        <div className="flex items-center gap-2">
          <span className="text-slate-300">|</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="px-2 py-1.5 border border-slate-200 rounded text-xs font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>
      </div>
    </div>
  );
};

MatchNavigation.propTypes = {
  activeFilter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  selectedDate: PropTypes.string.isRequired,
  onDateChange: PropTypes.func.isRequired,
  counts: PropTypes.shape({
    live: PropTypes.number,
    upcoming: PropTypes.number,
    finished: PropTypes.number
  })
};

export default MatchNavigation;