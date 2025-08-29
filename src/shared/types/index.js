import PropTypes from 'prop-types';

/**
 * Shared PropTypes definitions to eliminate duplication
 * Used across multiple components for consistency
 */

// Team PropType
export const TeamPropType = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string.isRequired,
  logo: PropTypes.string
});

// Match PropType (base)
export const MatchPropType = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  homeTeam: TeamPropType.isRequired,
  awayTeam: TeamPropType.isRequired,
  homeScore: PropTypes.number,
  awayScore: PropTypes.number,
  status: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  league: PropTypes.string,
  venue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      city: PropTypes.string
    })
  ]),
  elapsed: PropTypes.number
});

// Enhanced Match PropType (with API-Football format support)
export const EnhancedMatchPropType = PropTypes.shape({
  // Support both formats
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fixture: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    date: PropTypes.string,
    status: PropTypes.shape({
      short: PropTypes.string,
      elapsed: PropTypes.number
    }),
    venue: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      city: PropTypes.string
    })
  }),
  // Simple format
  homeTeam: TeamPropType,
  awayTeam: TeamPropType,
  homeScore: PropTypes.number,
  awayScore: PropTypes.number,
  status: PropTypes.string,
  date: PropTypes.string,
  league: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      logo: PropTypes.string
    })
  ]),
  venue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      city: PropTypes.string
    })
  ]),
  elapsed: PropTypes.number,
  // API-Football format
  teams: PropTypes.shape({
    home: TeamPropType,
    away: TeamPropType
  }),
  goals: PropTypes.shape({
    home: PropTypes.number,
    away: PropTypes.number
  })
});

// Common component props
export const MatchCardBasePropTypes = {
  match: MatchPropType.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  showDetails: PropTypes.bool,
  lastApiUpdate: PropTypes.instanceOf(Date)
};

export const MatchCardPropTypes = {
  match: EnhancedMatchPropType.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['modern', 'enhanced', 'prediction']),
  showPredictions: PropTypes.bool,
  showFavorites: PropTypes.bool,
  className: PropTypes.string
};

// Memoization helper
export const createMatchCardMemo = (componentName) => {
  return (prevProps, nextProps) => {
    const prevMatch = prevProps.match;
    const nextMatch = nextProps.match;
    
    // Extract ID from either format
    const prevId = prevMatch?.id || prevMatch?.fixture?.id;
    const nextId = nextMatch?.id || nextMatch?.fixture?.id;
    
    // Extract status from either format  
    const prevStatus = prevMatch?.status || prevMatch?.fixture?.status?.short;
    const nextStatus = nextMatch?.status || nextMatch?.fixture?.status?.short;
    
    // Extract scores from either format
    const prevHomeScore = prevMatch?.homeScore || prevMatch?.goals?.home;
    const nextHomeScore = nextMatch?.homeScore || nextMatch?.goals?.home;
    const prevAwayScore = prevMatch?.awayScore || prevMatch?.goals?.away;
    const nextAwayScore = nextMatch?.awayScore || nextMatch?.goals?.away;
    
    // Extract elapsed time from either format
    const prevElapsed = prevMatch?.elapsed || prevMatch?.fixture?.status?.elapsed;
    const nextElapsed = nextMatch?.elapsed || nextMatch?.fixture?.status?.elapsed;
    
    // Only re-render if critical match data changes
    return (
      prevId === nextId &&
      prevStatus === nextStatus &&
      prevHomeScore === nextHomeScore &&
      prevAwayScore === nextAwayScore &&
      prevElapsed === nextElapsed &&
      prevProps.className === nextProps.className &&
      prevProps.showDetails === nextProps.showDetails &&
      // Enhanced props (if they exist)
      prevProps.showPredictions === nextProps.showPredictions &&
      prevProps.showInsights === nextProps.showInsights
    );
  };
};