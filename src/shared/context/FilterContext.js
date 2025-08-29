import React, { createContext, useContext, useState } from 'react';

// Create the Filter Context
const FilterContext = createContext();

// Custom hook to use the filter context
export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

// Filter Provider component
export const FilterProvider = ({ children }) => {
  // Filter states
  const [selectedLeagues, setSelectedLeagues] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState(['all']);
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter actions
  const toggleLeague = (leagueId) => {
    setSelectedLeagues(prev => 
      prev.includes(leagueId) 
        ? prev.filter(id => id !== leagueId)
        : [...prev, leagueId]
    );
  };

  const toggleStatus = (statusId) => {
    setSelectedStatuses(prev => {
      if (statusId === 'all') {
        return ['all'];
      }
      const newStatuses = prev.filter(id => id !== 'all');
      return newStatuses.includes(statusId)
        ? newStatuses.filter(id => id !== statusId)
        : [...newStatuses, statusId];
    });
  };

  const setDateRange = (from, to) => {
    setDateFrom(from);
    setDateTo(to);
  };

  const clearAllFilters = () => {
    setSelectedLeagues([]);
    setSelectedStatuses(['all']);
    setDateFrom(new Date().toISOString().split('T')[0]);
    setDateTo(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setSearchQuery('');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedLeagues.length > 0) count++;
    if (selectedStatuses.length > 1 || !selectedStatuses.includes('all')) count++;
    if (searchQuery.trim()) count++;
    return count;
  };

  // Filter function to apply all filters to data
  const applyFilters = (data) => {
    if (!Array.isArray(data)) return data;

    return data.filter(item => {
      // Status filtering
      if (!selectedStatuses.includes('all')) {
        const statusMatch = selectedStatuses.some(status => {
          switch (status) {
            case 'live':
              return ['LIVE', '1H', '2H', 'HT'].includes(item.status);
            case 'upcoming':
              return ['NS', 'TBD'].includes(item.status);
            case 'finished':
              return ['FT', 'AET', 'PEN'].includes(item.status);
            default:
              return false;
          }
        });
        if (!statusMatch) return false;
      }

      // League filtering (if league info is available)
      if (selectedLeagues.length > 0 && item.league) {
        const leagueMatch = selectedLeagues.some(leagueId => {
          // Check if the league name matches our selected leagues
          const majorLeagues = {
            39: 'Premier League',
            140: 'La Liga', 
            135: 'Serie A',
            78: 'Bundesliga',
            61: 'Ligue 1',
            2: 'Champions League'
          };
          return item.league === majorLeagues[leagueId];
        });
        if (!leagueMatch) return false;
      }

      // Team search filtering
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const homeMatch = item.homeTeam?.name?.toLowerCase().includes(query);
        const awayMatch = item.awayTeam?.name?.toLowerCase().includes(query);
        const leagueMatch = item.league?.toLowerCase().includes(query);
        if (!homeMatch && !awayMatch && !leagueMatch) return false;
      }

      // Date filtering (if date info is available)
      if (item.date) {
        const itemDate = new Date(item.date).toISOString().split('T')[0];
        if (itemDate < dateFrom || itemDate > dateTo) return false;
      }

      return true;
    });
  };

  const value = {
    // State
    selectedLeagues,
    selectedStatuses,
    dateFrom,
    dateTo,
    searchQuery,
    
    // Actions
    toggleLeague,
    toggleStatus,
    setDateRange,
    setSearchQuery,
    clearAllFilters,
    getActiveFiltersCount,
    applyFilters,
    
    // Setters for direct updates
    setSelectedLeagues,
    setSelectedStatuses,
    setDateFrom,
    setDateTo
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};

export default FilterContext;
