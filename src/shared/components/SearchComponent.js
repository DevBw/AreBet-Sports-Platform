import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchIcon = ({ size = 20 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CloseIcon = ({ size = 18 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SearchComponent = ({ matches = [], onResultClick }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const navigate = useNavigate();

  // Debounce search for better performance
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);

  // Search through matches, teams, and leagues
  const searchResults = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) return [];

    const queryLower = debouncedQuery.toLowerCase();
    const results = [];

    matches.forEach(match => {
      const homeTeam = match.teams?.home?.name?.toLowerCase() || '';
      const awayTeam = match.teams?.away?.name?.toLowerCase() || '';
      const league = match.league?.name?.toLowerCase() || '';
      const country = match.league?.country?.toLowerCase() || '';

      if (
        homeTeam.includes(queryLower) ||
        awayTeam.includes(queryLower) ||
        league.includes(queryLower) ||
        country.includes(queryLower)
      ) {
        results.push({
          type: 'match',
          id: match.fixture.id,
          title: `${match.teams?.home?.name || 'Home'} vs ${match.teams?.away?.name || 'Away'}`,
          subtitle: `${match.league?.name || 'Unknown League'} • ${new Date(match.fixture.date).toLocaleDateString()}`,
          status: match.fixture.status?.short || 'NS',
          logo: match.league?.logo,
          match
        });
      }
    });

    // Group unique leagues
    const leagues = [...new Set(matches.map(m => m.league?.name).filter(Boolean))]
      .filter(league => league.toLowerCase().includes(queryLower))
      .slice(0, 3)
      .map(league => ({
        type: 'league',
        id: league,
        title: league,
        subtitle: 'League',
        logo: matches.find(m => m.league?.name === league)?.league?.logo
      }));

    // Group unique teams
    const teams = [];
    const seenTeams = new Set();
    
    matches.forEach(match => {
      [match.teams?.home, match.teams?.away].forEach(team => {
        if (team?.name && !seenTeams.has(team.name) && 
            team.name.toLowerCase().includes(queryLower)) {
          seenTeams.add(team.name);
          teams.push({
            type: 'team',
            id: team.id,
            title: team.name,
            subtitle: 'Team',
            logo: team.logo
          });
        }
      });
    });

    return [
      ...results.slice(0, 5),
      ...leagues,
      ...teams.slice(0, 3)
    ].slice(0, 8); // Limit total results
  }, [matches, debouncedQuery]);

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length > 0);
    setFocusedIndex(-1);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (!isOpen || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0) {
          handleResultClick(searchResults[focusedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, searchResults, focusedIndex]);

  const handleResultClick = useCallback((result) => {
    setQuery('');
    setIsOpen(false);
    setFocusedIndex(-1);
    
    if (onResultClick) {
      onResultClick(result);
    }

    // Navigate based on result type
    if (result.type === 'match') {
      navigate(`/match/${result.id}`);
    } else if (result.type === 'league') {
      // Could navigate to a league page
      console.log('Navigate to league:', result.title);
    } else if (result.type === 'team') {
      // Could navigate to a team page
      console.log('Navigate to team:', result.title);
    }
  }, [navigate, onResultClick]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setIsOpen(false);
    setFocusedIndex(-1);
    inputRef.current?.focus();
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'LIVE': case '1H': case '2H': case 'HT':
        return 'text-red-500';
      case 'FT':
        return 'text-green-500';
      case 'NS':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="relative search-container">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon size={18} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          placeholder="Search matches, teams, leagues..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          className="search-input-pro"
          aria-label="Search matches, teams, and leagues"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        />
        
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
            aria-label="Clear search"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {isOpen && (
        <div 
          ref={resultsRef}
          className="search-results-pro"
          role="listbox"
          aria-label="Search results"
        >
          {searchResults.length > 0 ? (
            <>
              <div className="search-results-header">
                <span className="text-sm font-semibold text-gray-400">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{debouncedQuery}"
                </span>
              </div>
              
              {searchResults.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className={`search-result-item ${
                    index === focusedIndex ? 'search-result-focused' : ''
                  }`}
                  role="option"
                  aria-selected={index === focusedIndex}
                >
                  <div className="flex items-center space-x-3">
                    {result.logo ? (
                      <img
                        src={result.logo}
                        alt=""
                        className="w-8 h-8 object-contain rounded"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-400">
                          {result.title.charAt(0)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-white truncate">
                          {result.title}
                        </p>
                        {result.status && result.type === 'match' && (
                          <span className={`text-xs font-bold ${getStatusColor(result.status)}`}>
                            {result.status}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate">
                        {result.subtitle}
                      </p>
                    </div>
                    
                    <div className="text-gray-500">
                      <svg width={16} height={16} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </>
          ) : debouncedQuery.length >= 2 ? (
            <div className="search-no-results">
              <div className="text-center py-8">
                <SearchIcon size={32} />
                <p className="mt-2 font-medium text-gray-300">No results found</p>
                <p className="text-sm text-gray-500">
                  Try different keywords or check your spelling
                </p>
              </div>
            </div>
          ) : (
            <div className="search-suggestions">
              <p className="text-sm text-gray-500 p-3">
                Type at least 2 characters to search
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchComponent;