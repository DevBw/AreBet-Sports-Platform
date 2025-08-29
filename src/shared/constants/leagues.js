// Shared league constants for AreBet Sports Platform

export const POPULAR_LEAGUES = [
  { id: 39, name: 'Premier League', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 140, name: 'La Liga', country: 'Spain', flag: '🇪🇸' },
  { id: 135, name: 'Serie A', country: 'Italy', flag: '🇮🇹' },
  { id: 78, name: 'Bundesliga', country: 'Germany', flag: '🇩🇪' },
  { id: 61, name: 'Ligue 1', country: 'France', flag: '🇫🇷' }
];

export const DEFAULT_LEAGUE_ID = 39; // Premier League

export const getLeagueById = (id) => {
  return POPULAR_LEAGUES.find(league => league.id === id);
};

export const getLeagueDisplayName = (league) => {
  if (!league) return 'Unknown League';
  return `${league.name} (${league.country})`;
};