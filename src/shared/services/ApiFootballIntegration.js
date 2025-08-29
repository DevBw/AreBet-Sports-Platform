// ===============================================
// API-FOOTBALL INTEGRATION SERVICE  
// Handles real sports data from RapidAPI with fallback to mock data
// ===============================================

import { supabase } from '../config/supabase';

class ApiFootballIntegration {
  constructor() {
    this.baseURL = 'https://api-football-v1.p.rapidapi.com/v3';
    this.apiKey = process.env.REACT_APP_RAPIDAPI_KEY;
    this.isConfigured = !!this.apiKey;
    
    // Rate limiting
    this.requestQueue = [];
    this.isProcessing = false;
    this.minInterval = 1000; // 1 second between requests
    this.lastRequest = 0;
    
    // Caching
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.defaultCacheDuration = 5 * 60 * 1000; // 5 minutes
    
    // Statistics
    this.stats = {
      totalRequests: 0,
      cacheHits: 0,
      apiCalls: 0,
      errors: 0,
      lastUpdate: null
    };

    this.log('🏈 API-Football Integration initialized', {
      configured: this.isConfigured,
      mode: this.isConfigured ? 'Live API' : 'Mock Data'
    });
  }

  log(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`, data || '');
  }

  // ===============================================
  // CORE API REQUEST HANDLER
  // ===============================================
  async makeRequest(endpoint, params = {}, cacheDuration = this.defaultCacheDuration) {
    this.stats.totalRequests++;
    
    // Build cache key
    const url = new URL(`${this.baseURL}${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });
    const cacheKey = url.toString();
    
    // Check cache first
    if (this.cache.has(cacheKey) && Date.now() < this.cacheExpiry.get(cacheKey)) {
      this.stats.cacheHits++;
      this.log('🔥 Cache hit', { endpoint, params });
      return this.cache.get(cacheKey);
    }

    // If API not configured, return mock data immediately
    if (!this.isConfigured) {
      this.log('🎭 Using mock data (no API key)', { endpoint, params });
      return this.getMockData(endpoint, params);
    }

    // Queue the request for rate limiting
    return new Promise((resolve) => {
      this.requestQueue.push({
        endpoint,
        params,
        cacheKey,
        cacheDuration,
        resolve
      });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.requestQueue.length > 0) {
      const timeSinceLastRequest = Date.now() - this.lastRequest;
      if (timeSinceLastRequest < this.minInterval) {
        await new Promise(resolve => setTimeout(resolve, this.minInterval - timeSinceLastRequest));
      }
      
      const { endpoint, params, cacheKey, cacheDuration, resolve } = this.requestQueue.shift();
      
      try {
        this.log('🌐 Making API request', { endpoint, params });
        this.stats.apiCalls++;
        
        const url = new URL(`${this.baseURL}${endpoint}`);
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key]);
          }
        });

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': this.apiKey,
            'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Cache successful response
        this.cache.set(cacheKey, data);
        this.cacheExpiry.set(cacheKey, Date.now() + cacheDuration);
        
        this.stats.lastUpdate = new Date().toISOString();
        resolve(data);
        
      } catch (error) {
        this.log('❌ API request failed', { endpoint, error: error.message });
        this.stats.errors++;
        
        // Return cached data if available, otherwise mock data
        const cachedData = this.cache.get(cacheKey);
        if (cachedData) {
          this.log('📦 Using stale cached data');
          resolve(cachedData);
        } else {
          this.log('🎭 Falling back to mock data');
          resolve(this.getMockData(endpoint, params));
        }
      }
      
      this.lastRequest = Date.now();
    }
    
    this.isProcessing = false;
  }

  // ===============================================
  // PUBLIC API METHODS
  // ===============================================

  async getLiveFixtures(options = {}) {
    const params = {
      live: 'all',
      timezone: options.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    if (options.league) params.league = options.league;
    
    return await this.makeRequest('/fixtures', params, 30000); // 30 second cache for live data
  }

  async getFixturesByDate(date, options = {}) {
    const params = {
      date: date || new Date().toISOString().split('T')[0],
      timezone: options.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    if (options.league) params.league = options.league;
    if (options.season) params.season = options.season;
    
    return await this.makeRequest('/fixtures', params);
  }

  async getFixturesByLeague(leagueId, season = new Date().getFullYear()) {
    return await this.makeRequest('/fixtures', {
      league: leagueId,
      season: season
    });
  }

  async getStandings(leagueId, season = new Date().getFullYear()) {
    return await this.makeRequest('/standings', {
      league: leagueId,
      season: season
    });
  }

  async getTeamsByLeague(leagueId, season = new Date().getFullYear()) {
    return await this.makeRequest('/teams', {
      league: leagueId,
      season: season
    });
  }

  async getLeagues(options = {}) {
    const params = {};
    if (options.country) params.country = options.country;
    if (options.season) params.season = options.season;
    
    return await this.makeRequest('/leagues', params);
  }

  async getPredictions(fixtureId) {
    return await this.makeRequest('/predictions', {
      fixture: fixtureId
    });
  }

  async getOdds(fixtureId) {
    return await this.makeRequest('/odds', {
      fixture: fixtureId
    });
  }

  // ===============================================
  // MOCK DATA GENERATION
  // ===============================================
  getMockData(endpoint, params) {
    const mockData = {
      '/fixtures': this.generateMockFixtures(params),
      '/standings': this.generateMockStandings(params),
      '/teams': this.generateMockTeams(params),
      '/leagues': this.generateMockLeagues(params),
      '/predictions': this.generateMockPredictions(params),
      '/odds': this.generateMockOdds(params)
    };

    return {
      response: mockData[endpoint] || [],
      get: 'mock',
      parameters: params,
      errors: [],
      results: mockData[endpoint]?.length || 0,
      paging: { current: 1, total: 1 }
    };
  }

  generateMockFixtures(params) {
    const isLive = params.live === 'all';
    const fixtures = [];

    // Sample teams and leagues
    const teams = [
      { id: 33, name: 'Manchester United', logo: 'https://media.api-sports.io/football/teams/33.png' },
      { id: 40, name: 'Liverpool', logo: 'https://media.api-sports.io/football/teams/40.png' },
      { id: 50, name: 'Manchester City', logo: 'https://media.api-sports.io/football/teams/50.png' },
      { id: 42, name: 'Arsenal', logo: 'https://media.api-sports.io/football/teams/42.png' }
    ];

    const league = {
      id: 39,
      name: 'Premier League',
      country: 'England',
      logo: 'https://media.api-sports.io/football/leagues/39.png',
      flag: 'https://media.api-sports.io/flags/gb.svg'
    };

    for (let i = 0; i < (isLive ? 3 : 8); i++) {
      const homeTeam = teams[Math.floor(Math.random() * teams.length)];
      let awayTeam = teams[Math.floor(Math.random() * teams.length)];
      while (awayTeam.id === homeTeam.id) {
        awayTeam = teams[Math.floor(Math.random() * teams.length)];
      }

      const date = new Date();
      if (isLive) {
        date.setMinutes(date.getMinutes() - Math.random() * 90); // Live matches started 0-90 mins ago
      } else {
        date.setHours(date.getHours() + (i * 3) - 6); // Spread across day
      }

      const status = isLive 
        ? (Math.random() < 0.5 ? '1H' : '2H')
        : (Math.random() < 0.3 ? 'FT' : 'NS');

      const elapsed = isLive ? Math.floor(Math.random() * 90) + 1 : null;
      const hasGoals = status === 'FT' || isLive;

      fixtures.push({
        fixture: {
          id: 1000 + i,
          referee: 'Michael Oliver',
          timezone: 'UTC',
          date: date.toISOString(),
          timestamp: Math.floor(date.getTime() / 1000),
          periods: {
            first: hasGoals ? date.getTime() / 1000 : null,
            second: hasGoals && status !== '1H' ? date.getTime() / 1000 + 2700 : null
          },
          venue: {
            id: 500 + i,
            name: homeTeam.name.includes('Manchester') ? 'Old Trafford' : 'Stadium',
            city: 'Manchester'
          },
          status: {
            long: status === '1H' ? 'First Half' : status === '2H' ? 'Second Half' : status === 'FT' ? 'Match Finished' : 'Not Started',
            short: status,
            elapsed: elapsed
          }
        },
        league,
        teams: {
          home: homeTeam,
          away: awayTeam
        },
        goals: {
          home: hasGoals ? Math.floor(Math.random() * 4) : null,
          away: hasGoals ? Math.floor(Math.random() * 4) : null
        },
        score: {
          halftime: {
            home: status === 'FT' ? Math.floor(Math.random() * 3) : null,
            away: status === 'FT' ? Math.floor(Math.random() * 3) : null
          },
          fulltime: {
            home: status === 'FT' ? Math.floor(Math.random() * 4) : null,
            away: status === 'FT' ? Math.floor(Math.random() * 4) : null
          }
        }
      });
    }

    return fixtures;
  }

  generateMockStandings(params) {
    const teams = [
      { id: 40, name: 'Liverpool', logo: 'https://media.api-sports.io/football/teams/40.png' },
      { id: 42, name: 'Arsenal', logo: 'https://media.api-sports.io/football/teams/42.png' },
      { id: 50, name: 'Manchester City', logo: 'https://media.api-sports.io/football/teams/50.png' },
      { id: 49, name: 'Chelsea', logo: 'https://media.api-sports.io/football/teams/49.png' }
    ];

    return [{
      league: {
        id: params.league || 39,
        name: 'Premier League',
        country: 'England',
        logo: 'https://media.api-sports.io/football/leagues/39.png',
        flag: 'https://media.api-sports.io/flags/gb.svg',
        season: params.season || new Date().getFullYear(),
        standings: [
          teams.map((team, index) => ({
            rank: index + 1,
            team,
            points: 38 - (index * 3),
            goalsDiff: 20 - (index * 5),
            group: 'Premier League',
            form: 'WWDWL',
            status: 'same',
            description: index === 0 ? 'Promotion - Champions League (Group Stage)' : null,
            all: {
              played: 16,
              win: 12 - index,
              draw: 2,
              lose: 2 + index,
              goals: {
                for: 35 - (index * 3),
                against: 12 + (index * 2)
              }
            }
          }))
        ]
      }
    }];
  }

  generateMockTeams(params) {
    return [
      { team: { id: 33, name: 'Manchester United', code: 'MUN', country: 'England', founded: 1878, logo: 'https://media.api-sports.io/football/teams/33.png' }, venue: { id: 556, name: 'Old Trafford', city: 'Manchester', capacity: 76000 } }
    ];
  }

  generateMockLeagues(params) {
    return [
      { league: { id: 39, name: 'Premier League', type: 'League', logo: 'https://media.api-sports.io/football/leagues/39.png' }, country: { name: 'England', code: 'GB', flag: 'https://media.api-sports.io/flags/gb.svg' } }
    ];
  }

  generateMockPredictions(params) {
    return [{
      predictions: {
        winner: { id: 40, name: 'Liverpool', comment: 'Liverpool has good form' },
        win_or_draw: true,
        under_over: 'Over 2.5',
        goals: { home: '1.8', away: '1.2' },
        advice: 'Liverpool wins',
        percent: { home: '58', draw: '24', away: '18' }
      }
    }];
  }

  generateMockOdds(params) {
    return [{
      bookmaker: { id: 6, name: 'Bwin' },
      bets: [{
        id: 1,
        name: 'Match Winner',
        values: [
          { value: 'Home', odd: '1.85' },
          { value: 'Draw', odd: '3.40' },  
          { value: 'Away', odd: '4.20' }
        ]
      }]
    }];
  }

  // ===============================================
  // SYNC WITH SUPABASE
  // ===============================================
  async syncFixturesToDatabase(fixtures) {
    try {
      const fixtureData = fixtures.map(f => ({
        id: f.fixture.id,
        league_id: f.league.id,
        season: new Date(f.fixture.date).getFullYear(),
        date: f.fixture.date,
        home_team_id: f.teams.home.id,
        away_team_id: f.teams.away.id,
        status_long: f.fixture.status.long,
        status_short: f.fixture.status.short,
        venue_name: f.fixture.venue?.name,
        venue_city: f.fixture.venue?.city,
        home_goals: f.goals.home,
        away_goals: f.goals.away
      }));

      const { data, error } = await supabase
        .from('fixtures')
        .upsert(fixtureData, { onConflict: 'id' });

      if (error) throw error;
      
      this.log('💾 Synced fixtures to database', { count: fixtureData.length });
      return data;
    } catch (error) {
      this.log('❌ Failed to sync fixtures', { error: error.message });
      throw error;
    }
  }

  // ===============================================
  // UTILITY METHODS
  // ===============================================
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.cache.size,
      isConfigured: this.isConfigured,
      queueLength: this.requestQueue.length
    };
  }

  clearCache() {
    this.cache.clear();
    this.cacheExpiry.clear();
    this.log('🗑️ Cache cleared');
  }

  healthCheck() {
    return {
      status: this.isConfigured ? 'configured' : 'mock_mode',
      apiKey: !!this.apiKey,
      cacheSize: this.cache.size,
      stats: this.getStats(),
      lastError: this.stats.lastError || null
    };
  }
}

export default new ApiFootballIntegration();