/**
 * Shared utilities for match data manipulation
 * Centralizes common match processing logic used across multiple components
 */

/**
 * Groups matches by league/competition
 * @param {Array} matches - Array of match objects
 * @param {string} defaultLeague - Default league name for matches without league
 * @returns {Object} Object with league names as keys and match arrays as values
 */
export const groupMatchesByLeague = (matches, defaultLeague = 'Other Competitions') => {
  return matches.reduce((acc, match) => {
    const league = match.league || defaultLeague;
    if (!acc[league]) {
      acc[league] = [];
    }
    acc[league].push(match);
    return acc;
  }, {});
};

/**
 * Filters matches by status
 * @param {Array} matches - Array of match objects
 * @param {string} status - Status to filter by ('upcoming', 'live', 'finished', 'all')
 * @returns {Array} Filtered matches
 */
export const filterMatchesByStatus = (matches, status) => {
  if (status === 'all') return matches;
  
  switch (status) {
    case 'upcoming':
      return matches.filter(match => ['NS', 'TBD'].includes(match.status));
    case 'live':
      return matches.filter(match => ['LIVE', '1H', '2H', 'HT'].includes(match.status));
    case 'finished':
      return matches.filter(match => match.status === 'FT');
    default:
      return matches;
  }
};

/**
 * Sorts leagues by priority (popular leagues first)
 * @param {Object} groupedMatches - Object with league names as keys
 * @param {Array} priorityLeagues - Array of priority league names
 * @returns {Array} Sorted array of [leagueName, matches] pairs
 */
export const sortLeaguesByPriority = (groupedMatches, priorityLeagues = []) => {
  const defaultPriority = [
    'Premier League',
    'La Liga',
    'Serie A', 
    'Bundesliga',
    'Ligue 1',
    'Champions League',
    'Europa League',
    'UEFA Nations League'
  ];
  
  const leagues = priorityLeagues.length > 0 ? priorityLeagues : defaultPriority;
  
  return Object.entries(groupedMatches).sort(([leagueA], [leagueB]) => {
    const indexA = leagues.indexOf(leagueA);
    const indexB = leagues.indexOf(leagueB);
    
    // If both leagues are in priority list, sort by priority
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    
    // Priority leagues come first
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    
    // Alphabetical for non-priority leagues
    return leagueA.localeCompare(leagueB);
  });
};

/**
 * Gets status display information for a match status
 * Centralizes the status display logic used in MatchCard and EnhancedMatchCard
 * @param {string} status - Match status code
 * @returns {Object} Object with text and CSS class
 */
export const getStatusDisplay = (status) => {
  switch (status) {
    case 'LIVE':
    case '1H':
    case '2H':
      return { text: 'LIVE', class: 'status-live' };
    case 'HT':
      return { text: 'HALF TIME', class: 'status-live' };
    case 'FT':
      return { text: 'FULL TIME', class: 'status-finished' };
    case 'NS':
      return { text: 'UPCOMING', class: 'status-upcoming' };
    case 'TBD':
      return { text: 'TBD', class: 'status-upcoming' };
    case 'PST':
      return { text: 'POSTPONED', class: 'status-upcoming' };
    case 'CANC':
      return { text: 'CANCELLED', class: 'status-finished' };
    default:
      return { text: status || 'UNKNOWN', class: 'status-upcoming' };
  }
};

/**
 * Checks if a match is currently live
 * @param {string} status - Match status code
 * @returns {boolean} True if match is live
 */
export const isMatchLive = (status) => {
  return ['LIVE', '1H', '2H', 'HT', 'ET', 'BT', 'P'].includes(status);
};

/**
 * Checks if a match is upcoming
 * @param {string} status - Match status code
 * @returns {boolean} True if match is upcoming
 */
export const isMatchUpcoming = (status) => {
  return ['NS', 'TBD', 'PST'].includes(status);
};

/**
 * Checks if a match is finished
 * @param {string} status - Match status code
 * @returns {boolean} True if match is finished
 */
export const isMatchFinished = (status) => {
  return ['FT', 'AET', 'PEN', 'CANC'].includes(status);
};

/**
 * Categorizes matches into live, upcoming, and finished with enhanced logic
 * @param {Array} liveMatches - Array of live matches from API
 * @param {Array} dateMatches - Array of matches for specific date from API
 * @returns {Object} Object containing categorized matches and counts
 */
export const categorizeMatchesEnhanced = (liveMatches = [], dateMatches = []) => {
  // Validate inputs
  const validLiveMatches = Array.isArray(liveMatches) ? liveMatches : [];
  const validDateMatches = Array.isArray(dateMatches) ? dateMatches : [];
  
  const live = validLiveMatches;
  const upcoming = validDateMatches.filter(match => {
    // Handle both API format (match.fixture.status.short) and mock format (match.status)
    const status = match.fixture?.status?.short || match.status;
    return isMatchUpcoming(status);
  });
  const finished = validDateMatches.filter(match => {
    // Handle both API format (match.fixture.status.short) and mock format (match.status)
    const status = match.fixture?.status?.short || match.status;
    return isMatchFinished(status);
  });

  return {
    live,
    upcoming,
    finished,
    counts: {
      live: live.length,
      upcoming: upcoming.length,
      finished: finished.length
    }
  };
};

/**
 * Filters matches based on active filter type with enhanced logic
 * @param {Object} categorizedMatches - Object from categorizeMatches function
 * @param {string} activeFilter - Current active filter (live, upcoming, finished)
 * @returns {Array} Filtered matches array
 */
export const filterMatchesByTypeEnhanced = (categorizedMatches, activeFilter) => {
  if (!categorizedMatches || typeof categorizedMatches !== 'object') {
    return [];
  }
  
  const { live = [], upcoming = [], finished = [] } = categorizedMatches;
  
  switch(activeFilter) {
    case 'live':
      return live;
    case 'upcoming':
      return upcoming;
    case 'finished':
      return finished;
    default:
      return [...live, ...upcoming, ...finished];
  }
};

/**
 * Generates a stable key for match components
 * @param {Object} match - Match object
 * @param {number} index - Array index as fallback
 * @returns {string} Stable key for React component
 */
export const generateMatchKey = (match, index) => {
  if (!match || typeof match !== 'object') {
    return `match-${index}`;
  }
  
  return match.fixture?.id || match.id || `match-${index}`;
};

/**
 * Gets empty state message based on filter type
 * @param {string} filterType - Current filter type
 * @returns {string} Appropriate empty state message
 */
export const getEmptyStateMessage = (filterType) => {
  const messages = {
    live: 'No Live Matches',
    upcoming: 'No Upcoming Matches',
    finished: 'No Finished Matches'
  };
  
  return messages[filterType] || 'No Matches Found';
};

/**
 * Validates API response structure
 * @param {Object} response - API response object
 * @returns {Array} Valid response array or empty array
 */
export const validateApiResponse = (response) => {
  if (!response || typeof response !== 'object') {
    return [];
  }
  
  return Array.isArray(response.response) ? response.response : [];
};

/**
 * Gets today's date in YYYY-MM-DD format
 * @returns {string} Today's date string
 */
export const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Gets current season year
 * @returns {number} Current season year
 */
export const getCurrentSeason = () => {
  return new Date().getFullYear();
};

/**
 * Groups matches by league with major leagues prioritized at the top
 * @param {Array} matches - Array of match objects
 * @returns {Array} Array of league objects with matches grouped and sorted
 */
export const groupMatchesByLeagueWithPriority = (matches) => {
  if (!Array.isArray(matches) || matches.length === 0) {
    return [];
  }

  // Group matches by league
  const grouped = matches.reduce((acc, match) => {
    const league = match.league?.name || match.fixture?.league?.name || 'Other Competitions';
    const leagueId = match.league?.id || match.fixture?.league?.id || 'other';
    const leagueLogo = match.league?.logo || match.fixture?.league?.logo || '';
    
    if (!acc[league]) {
      acc[league] = {
        name: league,
        id: leagueId,
        logo: leagueLogo,
        matches: []
      };
    }
    acc[league].matches.push(match);
    return acc;
  }, {});

  // Major leagues in priority order
  const majorLeagues = [
    'Premier League',
    'La Liga',
    'Serie A',
    'Bundesliga',
    'Ligue 1',
    'UEFA Champions League',
    'UEFA Europa League',
    'UEFA Nations League',
    'FIFA World Cup',
    'UEFA European Championship'
  ];

  // Sort leagues with major leagues first
  return Object.values(grouped).sort((a, b) => {
    const indexA = majorLeagues.findIndex(major => a.name.includes(major));
    const indexB = majorLeagues.findIndex(major => b.name.includes(major));
    
    // Both are major leagues
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    
    // Only A is major
    if (indexA !== -1 && indexB === -1) {
      return -1;
    }
    
    // Only B is major
    if (indexA === -1 && indexB !== -1) {
      return 1;
    }
    
    // Neither is major - sort alphabetically
    return a.name.localeCompare(b.name);
  });
};

/**
 * Configuration constants for the Dashboard
 */
export const DASHBOARD_CONFIG = {
  REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes (reduced from 1 minute to prevent rate limiting)
  FILTER_TYPES: {
    LIVE: 'live',
    UPCOMING: 'upcoming',
    FINISHED: 'finished'
  },
  MATCH_STATUS: {
    LIVE: ['LIVE', '1H', '2H', 'HT', 'ET'],
    UPCOMING: ['NS', 'TBD'],
    FINISHED: ['FT']
  }
};