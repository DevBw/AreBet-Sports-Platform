// League Color System for AreBet Sports Platform

export const LEAGUE_COLORS = {
  // Premier League
  'Premier League': {
    primary: '#37003c',
    secondary: '#4a0048', 
    gradient: 'linear-gradient(135deg, #37003c, #4a0048)',
    accent: '#e90052',
    flag: '🇬🇧',
    emoji: '👑',
    importance: 'elite'
  },
  
  // La Liga
  'La Liga': {
    primary: '#ff6900',
    secondary: '#ff8533',
    gradient: 'linear-gradient(135deg, #ff6900, #ff8533)',
    accent: '#ff4500',
    flag: '🇪🇸',
    emoji: '🐂',
    importance: 'elite'
  },
  
  // Serie A
  'Serie A': {
    primary: '#0066cc',
    secondary: '#3385ff',
    gradient: 'linear-gradient(135deg, #0066cc, #3385ff)',
    accent: '#004499',
    flag: '🇮🇹',
    emoji: '🍝',
    importance: 'elite'
  },
  
  // Bundesliga
  'Bundesliga': {
    primary: '#d20515',
    secondary: '#ff3347',
    gradient: 'linear-gradient(135deg, #d20515, #ff3347)',
    accent: '#b00414',
    flag: '🇩🇪',
    emoji: '🍺',
    importance: 'elite'
  },
  
  // Ligue 1
  'Ligue 1': {
    primary: '#dae025',
    secondary: '#f0ff58',
    gradient: 'linear-gradient(135deg, #dae025, #f0ff58)',
    accent: '#c4ca24',
    flag: '🇫🇷',
    emoji: '🥖',
    importance: 'elite'
  },
  
  // Champions League
  'Champions League': {
    primary: '#00347a',
    secondary: '#0066cc',
    gradient: 'linear-gradient(135deg, #00347a, #0066cc)',
    accent: '#001f4d',
    flag: '🏆',
    emoji: '👑',
    importance: 'elite'
  },
  
  // Europa League
  'Europa League': {
    primary: '#ff6900',
    secondary: '#ffb366',
    gradient: 'linear-gradient(135deg, #ff6900, #ffb366)',
    accent: '#e55a00',
    flag: '🥈',
    emoji: '⚔️',
    importance: 'high'
  },
  
  // Conference League
  'Conference League': {
    primary: '#7209b7',
    secondary: '#a663cc',
    gradient: 'linear-gradient(135deg, #7209b7, #a663cc)',
    accent: '#5c0791',
    flag: '🥉',
    emoji: '🌟',
    importance: 'high'
  },
  
  // MLS
  'MLS': {
    primary: '#005595',
    secondary: '#0073b3',
    gradient: 'linear-gradient(135deg, #005595, #0073b3)',
    accent: '#003d6b',
    flag: '🇺🇸',
    emoji: '🦅',
    importance: 'regional'
  },
  
  // World Cup
  'World Cup': {
    primary: '#b8860b',
    secondary: '#daa520',
    gradient: 'linear-gradient(135deg, #b8860b, #daa520)',
    accent: '#9a7209',
    flag: '🌍',
    emoji: '🏆',
    importance: 'ultimate'
  },
  
  // European Championship
  'European Championship': {
    primary: '#003f7f',
    secondary: '#0066cc',
    gradient: 'linear-gradient(135deg, #003f7f, #0066cc)',
    accent: '#002d5c',
    flag: '🇪🇺',
    emoji: '👑',
    importance: 'ultimate'
  },
  
  // Copa America
  'Copa America': {
    primary: '#c41e3a',
    secondary: '#e53e3e',
    gradient: 'linear-gradient(135deg, #c41e3a, #e53e3e)',
    accent: '#9e1829',
    flag: '🏆',
    emoji: '⚽',
    importance: 'ultimate'
  }
};

// Default fallback for unknown leagues
const DEFAULT_LEAGUE = {
  primary: '#666666',
  secondary: '#999999',
  gradient: 'linear-gradient(135deg, #666666, #999999)',
  accent: '#555555',
  flag: '⚽',
  emoji: '🏟️',
  importance: 'normal'
};

/**
 * Get league information including colors and styling
 * @param {string} leagueName - Name of the league
 * @returns {object} League color and styling information
 */
export const getLeagueInfo = (leagueName) => {
  if (!leagueName) return DEFAULT_LEAGUE;
  
  // Try exact match first
  if (LEAGUE_COLORS[leagueName]) {
    return LEAGUE_COLORS[leagueName];
  }
  
  // Try partial matches for variations
  const leagueKey = Object.keys(LEAGUE_COLORS).find(key => 
    leagueName.includes(key) || key.includes(leagueName)
  );
  
  if (leagueKey) {
    return LEAGUE_COLORS[leagueKey];
  }
  
  return DEFAULT_LEAGUE;
};

/**
 * Get CSS variables for a league
 * @param {string} leagueName - Name of the league
 * @returns {object} CSS custom properties object
 */
export const getLeagueCSSVars = (leagueName) => {
  const info = getLeagueInfo(leagueName);
  return {
    '--league-primary': info.primary,
    '--league-secondary': info.secondary,
    '--league-gradient': info.gradient,
    '--league-accent': info.accent
  };
};

/**
 * Get league importance level
 * @param {string} leagueName - Name of the league
 * @returns {string} Importance level: 'ultimate', 'elite', 'high', 'regional', 'normal'
 */
export const getLeagueImportance = (leagueName) => {
  const info = getLeagueInfo(leagueName);
  return info.importance;
};

/**
 * Get all leagues of a specific importance level
 * @param {string} importance - Importance level to filter by
 * @returns {array} Array of league names
 */
export const getLeaguesByImportance = (importance) => {
  return Object.entries(LEAGUE_COLORS)
    .filter(([, info]) => info.importance === importance)
    .map(([name]) => name);
};

/**
 * Check if a league is considered a top-tier competition
 * @param {string} leagueName - Name of the league
 * @returns {boolean} True if elite or ultimate level
 */
export const isTopTierLeague = (leagueName) => {
  const importance = getLeagueImportance(leagueName);
  return importance === 'elite' || importance === 'ultimate';
};

/**
 * Get themed class names based on league
 * @param {string} leagueName - Name of the league
 * @returns {string} CSS class names
 */
export const getLeagueClasses = (leagueName) => {
  const importance = getLeagueImportance(leagueName);
  const baseClass = 'league-themed';
  const importanceClass = `league-${importance}`;
  
  return `${baseClass} ${importanceClass}`;
};

const leagueUtils = {
  getLeagueInfo,
  getLeagueCSSVars,
  getLeagueImportance,
  getLeaguesByImportance,
  isTopTierLeague,
  getLeagueClasses,
  LEAGUE_COLORS
};

export default leagueUtils;