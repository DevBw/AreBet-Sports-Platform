import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { useFilters } from '../context';

const Sidebar = ({ isOpen, onClose }) => {
  // Get filter state and actions from context
  const {
    selectedLeagues,
    selectedStatuses,
    dateFrom,
    dateTo,
    searchQuery,
    toggleLeague,
    toggleStatus,
    setDateRange,
    setSearchQuery,
    clearAllFilters,
    getActiveFiltersCount
  } = useFilters();

  // Local sidebar state
  const [accordions, setAccordions] = useState({
    leagues: true,
    teams: false,
    dates: false,
    status: false
  });
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode
  const [liveUpdates, setLiveUpdates] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);

  const loadLeagues = async () => {
    try {
      setLoading(true);
      // Use hardcoded major leagues for now
      const majorLeagues = [
        { id: 39, name: 'Premier League', flag: '🇬🇧', country: 'England' },
        { id: 140, name: 'La Liga', flag: '🇪🇸', country: 'Spain' },
        { id: 135, name: 'Serie A', flag: '🇮🇹', country: 'Italy' },
        { id: 78, name: 'Bundesliga', flag: '🇩🇪', country: 'Germany' },
        { id: 61, name: 'Ligue 1', flag: '🇫🇷', country: 'France' },
        { id: 2, name: 'Champions League', flag: '🏆', country: 'Europe' }
      ];
      setLeagues(majorLeagues);
    } catch (error) {
      console.error('Error loading leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accordions.leagues) {
      loadLeagues();
    }
  }, [accordions.leagues]);

  const toggleAccordion = (key) => {
    setAccordions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const setQuickDate = (days) => {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + days);
    setDateRange(from.toISOString().split('T')[0], to.toISOString().split('T')[0]);
  };

  const toggleDarkMode = (enabled) => {
    setDarkMode(enabled);
    
    // Apply dark mode to the document
    if (enabled) {
      document.documentElement.classList.add('dark-mode');
      document.body.style.backgroundColor = '#0C0C0C';
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.style.backgroundColor = '#FFFFFF';
    }
    
    // Store preference in localStorage
    localStorage.setItem('darkMode', enabled.toString());
  };

  const toggleLiveUpdates = (enabled) => {
    setLiveUpdates(enabled);
    localStorage.setItem('liveUpdates', enabled.toString());
  };

  const toggleSoundAlerts = (enabled) => {
    setSoundAlerts(enabled);
    localStorage.setItem('soundAlerts', enabled.toString());
  };

  // Load preferences on component mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedLiveUpdates = localStorage.getItem('liveUpdates');
    const savedSoundAlerts = localStorage.getItem('soundAlerts');
    
    // Initialize dark mode (default to dark if no preference saved)
    if (savedDarkMode !== null) {
      const isDark = savedDarkMode === 'true';
      setDarkMode(isDark);
      // Apply the mode without triggering the full toggle logic
      if (isDark) {
        document.documentElement.classList.add('dark-mode');
        document.body.style.backgroundColor = '#0C0C0C';
      } else {
        document.documentElement.classList.remove('dark-mode');
        document.body.style.backgroundColor = '#FFFFFF';
      }
    } else {
      // Default to dark mode on first visit
      document.documentElement.classList.add('dark-mode');
      document.body.style.backgroundColor = '#0C0C0C';
      localStorage.setItem('darkMode', 'true');
    }
    
    if (savedLiveUpdates !== null) {
      const isEnabled = savedLiveUpdates === 'true';
      setLiveUpdates(isEnabled);
    }
    
    if (savedSoundAlerts !== null) {
      const isEnabled = savedSoundAlerts === 'true';
      setSoundAlerts(isEnabled);
    }
  }, []);

  const matchStatuses = [
    { id: 'all', name: 'All Matches' },
    { id: 'live', name: 'Live' },
    { id: 'upcoming', name: 'Upcoming' },
    { id: 'finished', name: 'Finished' }
  ];

  const FilterAccordion = ({ title, isOpen, onToggle, children }) => (
    <div className="filter-accordion">
      <button 
        className="filter-accordion-header w-full"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="filter-accordion-title">{title}</span>
        <Icon 
          name="chevronDown" 
          className={`filter-accordion-icon ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="filter-accordion-content">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay md-hidden" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`sidebar ${isOpen ? 'open' : ''}`}
        aria-label="Filters and options"
        aria-hidden={!isOpen ? 'true' : 'false'}
      >
        <div className="sidebar-content">
          {/* Leagues Filter */}
          <div className="filter-section">
            <FilterAccordion
              title="Leagues & Competitions"
              isOpen={accordions.leagues}
              onToggle={() => toggleAccordion('leagues')}
            >
              <div className="filter-options">
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="spinner w-4 h-4"></div>
                    <span className="ml-2 text-xs text-secondary">Loading...</span>
                  </div>
                ) : (
                  leagues.map((league) => (
                    <label key={league.id} className="filter-option" onClick={() => toggleLeague(league.id)}>
                      <div className={`filter-checkbox ${selectedLeagues.includes(league.id) ? 'checked' : ''}`}></div>
                      <span className="flex items-center gap-2">
                        <span>{league.flag}</span>
                        <span className="filter-label">{league.name}</span>
                      </span>
                    </label>
                  ))
                )}
              </div>
            </FilterAccordion>
          </div>

          {/* Date Range Filter */}
          <div className="filter-section">
            <FilterAccordion
              title="Date Range"
              isOpen={accordions.dates}
              onToggle={() => toggleAccordion('dates')}
            >
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">From Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={dateFrom}
                    onChange={(e) => setDateRange(e.target.value, dateTo)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">To Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={dateTo}
                    onChange={(e) => setDateRange(dateFrom, e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-sm btn-secondary" onClick={() => setQuickDate(0)}>Today</button>
                  <button className="btn btn-sm btn-secondary" onClick={() => setQuickDate(7)}>Week</button>
                  <button className="btn btn-sm btn-secondary" onClick={() => setQuickDate(30)}>Month</button>
                </div>
              </div>
            </FilterAccordion>
          </div>

          {/* Match Status Filter */}
          <div className="filter-section">
            <FilterAccordion
              title="Match Status"
              isOpen={accordions.status}
              onToggle={() => toggleAccordion('status')}
            >
              <div className="filter-options">
                {matchStatuses.map((status) => (
                  <label key={status.id} className="filter-option" onClick={() => toggleStatus(status.id)}>
                    <div className={`filter-checkbox ${selectedStatuses.includes(status.id) ? 'checked' : ''}`}></div>
                    <span className="filter-label">{status.name}</span>
                  </label>
                ))}
              </div>
            </FilterAccordion>
          </div>

          {/* Team Search */}
          <div className="filter-section">
            <div className="sidebar-title">Team Search</div>
            <div className="form-group">
              <input 
                type="text" 
                placeholder="Search teams..." 
                className="form-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Quick Settings */}
          <div className="filter-section">
            <div className="sidebar-title">Quick Settings</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary">Live Updates</span>
                <label className="toggle">
                  <input 
                    type="checkbox" 
                    className="toggle-input" 
                    checked={liveUpdates}
                    onChange={(e) => toggleLiveUpdates(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary">Sound Alerts</span>
                <label className="toggle">
                  <input 
                    type="checkbox" 
                    className="toggle-input" 
                    checked={soundAlerts}
                    onChange={(e) => toggleSoundAlerts(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary">Dark Mode</span>
                <label className="toggle">
                  <input 
                    type="checkbox" 
                    className="toggle-input" 
                    checked={darkMode}
                    onChange={(e) => toggleDarkMode(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Filter Summary */}
          <div className="filter-section">
            <div className="p-3 bg-glass rounded-lg border border-border">
              <div className="text-sm font-semibold text-primary mb-2">Active Filters</div>
              <div className="text-xs text-secondary space-y-1">
                <div>Leagues: {selectedLeagues.length || 'All'}</div>
                <div>Date Range: {dateFrom} to {dateTo}</div>
                <div>Status: {selectedStatuses.join(', ')}</div>
              </div>
              {getActiveFiltersCount() > 0 && (
                <button 
                  className="btn btn-secondary w-full mt-3"
                  onClick={clearAllFilters}
                >
                  <Icon name="x" size={16} />
                  Clear All Filters ({getActiveFiltersCount()})
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
