// Mock match data to showcase new features
export const mockMatches = [
  {
    id: 1,
    fixture: {
      id: 1,
      date: new Date().toISOString(),
      status: { short: 'NS', long: 'Not Started', elapsed: null },
      venue: { name: 'Emirates Stadium', city: 'London' }
    },
    league: { name: 'Premier League', logo: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23e91e63"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="12" font-family="Arial">PL</text></svg>' },
    teams: {
      home: {
        id: 42,
        name: 'Arsenal',
        logo: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23dc143c"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="11" font-family="Arial">ARS</text></svg>'
      },
      away: {
        id: 33,
        name: 'Manchester United', 
        logo: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23da020e"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="11" font-family="Arial">MUN</text></svg>'
      }
    },
    goals: { home: null, away: null },
    homeTeam: {
      id: 42,
      name: 'Arsenal',
      logo: 'https://via.placeholder.com/40x40?text=ARS'
    },
    awayTeam: {
      id: 33,
      name: 'Manchester United',
      logo: 'https://via.placeholder.com/40x40?text=MUN'
    },
    status: 'NS',
    time: new Date().toLocaleTimeString(),
    venue: { name: 'Emirates Stadium', city: 'London' }
  },
  {
    id: 2,
    fixture: {
      id: 2,
      date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      status: { short: 'NS', long: 'Not Started', elapsed: null },
      venue: { name: 'Anfield', city: 'Liverpool' }
    },
    league: { name: 'Premier League', logo: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23e91e63"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="12" font-family="Arial">PL</text></svg>' },
    teams: {
      home: {
        id: 40,
        name: 'Liverpool',
        logo: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23c8102e"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="11" font-family="Arial">LIV</text></svg>'
      },
      away: {
        id: 50,
        name: 'Manchester City',
        logo: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%236cabdd"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="11" font-family="Arial">MCI</text></svg>'
      }
    },
    goals: { home: null, away: null },
    homeTeam: {
      id: 40,
      name: 'Liverpool',
      logo: 'https://via.placeholder.com/40x40?text=LIV'
    },
    awayTeam: {
      id: 50,
      name: 'Manchester City',
      logo: 'https://via.placeholder.com/40x40?text=MCI'
    },
    status: 'NS',
    time: new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleTimeString(),
    venue: { name: 'Anfield', city: 'Liverpool' }
  },
  {
    id: 3,
    fixture: {
      id: 3,
      date: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Started 30 min ago
      status: { short: '1H', long: 'First Half', elapsed: 35 },
      venue: { name: 'Stamford Bridge', city: 'London' }
    },
    league: { name: 'Premier League', logo: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23e91e63"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="12" font-family="Arial">PL</text></svg>' },
    teams: {
      home: {
        id: 49,
        name: 'Chelsea',
        logo: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23034694"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="11" font-family="Arial">CHE</text></svg>'
      },
      away: {
        id: 47,
        name: 'Tottenham',
        logo: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23132257"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="11" font-family="Arial">TOT</text></svg>'
      }
    },
    goals: { home: 1, away: 0 },
    homeTeam: {
      id: 49,
      name: 'Chelsea',
      logo: 'https://via.placeholder.com/40x40?text=CHE'
    },
    awayTeam: {
      id: 47,
      name: 'Tottenham',
      logo: 'https://via.placeholder.com/40x40?text=TOT'
    },
    status: '1H',
    time: '35\'',
    elapsed: 35,
    venue: { name: 'Stamford Bridge', city: 'London' }
  },
  {
    id: 4,
    fixture: {
      id: 4,
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Finished 2 hours ago
      status: { short: 'FT', long: 'Full Time', elapsed: 90 },
      venue: { name: 'Old Trafford', city: 'Manchester' }
    },
    league: { name: 'Premier League', logo: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23e91e63"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="12" font-family="Arial">PL</text></svg>' },
    teams: {
      home: {
        id: 33,
        name: 'Manchester United',
        logo: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23da020e"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="11" font-family="Arial">MUN</text></svg>'
      },
      away: {
        id: 34,
        name: 'Newcastle',
        logo: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23241f20"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="11" font-family="Arial">NEW</text></svg>'
      }
    },
    goals: { home: 2, away: 1 },
    homeTeam: {
      id: 33,
      name: 'Manchester United',
      logo: 'https://via.placeholder.com/40x40?text=MUN'
    },
    awayTeam: {
      id: 34,
      name: 'Newcastle',
      logo: 'https://via.placeholder.com/40x40?text=NEW'
    },
    status: 'FT',
    time: 'FT',
    venue: { name: 'Old Trafford', city: 'Manchester' }
  }
];

export const mockLiveMatches = mockMatches.filter(match => 
  ['1H', '2H', 'HT', 'LIVE'].includes(match.status)
);

export const mockUpcomingMatches = mockMatches.filter(match => 
  match.status === 'NS'
);

export const mockFinishedMatches = mockMatches.filter(match => 
  match.status === 'FT'
);