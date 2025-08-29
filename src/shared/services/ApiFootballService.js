
/**
 * Simplified API service with rate limiting and caching
 * Replaces the massive SupabaseService with a cleaner architecture
 */
class ApiFootballService {
  constructor() {
    this.apiKey = process.env.REACT_APP_API_FOOTBALL_KEY;
    this.baseURL = 'https://api-football-v1.p.rapidapi.com/v3';
    
    // Rate limiting
    this.lastRequestTime = 0;
    this.requestQueue = [];
    this.isProcessingQueue = false;
    this.minRequestInterval = 2000; // 2 seconds between requests
    
    // Caching
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.defaultCacheDuration = 5 * 60 * 1000; // 5 minutes
  }

  // Rate-limited request method
  async makeRequest(endpoint, cacheDuration = this.defaultCacheDuration) {
    // Check cache first
    const cacheKey = endpoint;
    if (this.cache.has(cacheKey) && Date.now() < this.cacheExpiry.get(cacheKey)) {
      console.log(`Cache hit for: ${endpoint}`);
      return this.cache.get(cacheKey);
    }

    // Add to queue if rate limiting is needed
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ endpoint, resolve, reject, cacheDuration });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      if (timeSinceLastRequest < this.minRequestInterval) {
        await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest));
      }
      
      const { endpoint, resolve, reject: _reject, cacheDuration } = this.requestQueue.shift();
      
      try {
        console.log(`Making API request: ${endpoint}`);
        const response = await fetch(`${this.baseURL}${endpoint}`, {
          headers: {
            'X-RapidAPI-Key': this.apiKey,
            'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
          }
        });

        if (!response.ok) {
          if (response.status === 429) {
            console.warn('Rate limit hit, using fallback data');
            resolve(this.getFallbackData(endpoint));
          } else if (response.status === 403) {
            console.warn('API access forbidden, using fallback data');
            resolve(this.getFallbackData(endpoint));
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } else {
          const data = await response.json();
          
          // Cache the response
          this.cache.set(endpoint, data);
          this.cacheExpiry.set(endpoint, Date.now() + cacheDuration);
          
          resolve(data);
        }
        
        this.lastRequestTime = Date.now();
      } catch (error) {
        console.error('API request failed:', error);
        resolve(this.getFallbackData(endpoint));
      }
    }
    
    this.isProcessingQueue = false;
  }

  // Fallback data for when API fails
  getFallbackData(endpoint) {
    if (endpoint.includes('live=all')) {
      return {
        response: [
          {
            fixture: { id: 1, date: '2025-08-24T15:00:00Z', status: { short: 'LIVE', elapsed: 45 } },
            teams: { 
              home: { id: 1, name: 'Manchester United', logo: 'https://media.api-sports.io/football/teams/33.png' },
              away: { id: 2, name: 'Liverpool', logo: 'https://media.api-sports.io/football/teams/40.png' }
            },
            goals: { home: 1, away: 2 },
            league: { id: 39, name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png' }
          }
        ]
      };
    }
    
    if (endpoint.includes('fixtures?date=')) {
      return {
        response: [
          {
            fixture: { id: 2, date: '2025-08-24T18:00:00Z', status: { short: 'NS' } },
            teams: { 
              home: { id: 3, name: 'Chelsea', logo: 'https://media.api-sports.io/football/teams/49.png' },
              away: { id: 4, name: 'Arsenal', logo: 'https://media.api-sports.io/football/teams/42.png' }
            },
            goals: { home: null, away: null },
            league: { id: 39, name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png' }
          }
        ]
      };
    }
    
    return { response: [] };
  }

  // Clear expired cache entries
  clearExpiredCache() {
    const now = Date.now();
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (now > expiry) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }
  }

  // Essential Fixtures & Matches - simplified versions for Dashboard
  async getLiveFixtures() {
    // Skip API calls entirely and use mock data for demonstration
    console.log('🎭 Using mock live fixtures for demonstration');
    const { mockMatches } = await import('../data/mockMatches');
    const liveMatches = mockMatches.filter(match => ['1H', '2H', 'HT', 'LIVE'].includes(match.status));
    console.log('🎭 Live matches found:', liveMatches.length, liveMatches);
    return { 
      response: liveMatches
    };
  }
  
  async getFixturesByDate(date) {
    // Skip API calls entirely and use mock data for demonstration  
    console.log(`🎭 Using mock fixtures for ${date}`);
    const { mockMatches } = await import('../data/mockMatches');
    console.log('🎭 Date matches found:', mockMatches.length, mockMatches);
    return { response: mockMatches };
  }

  // Essential Standings - only method needed for Dashboard
  async getStandings(league, season) {
    // Return empty for now to avoid API errors
    console.log(`🎭 Skipping standings API for league ${league}`);
    return { response: [] };
  }

  // Placeholder methods for features not yet implemented
  async getPredictions(fixture) { 
    console.warn('Predictions not yet implemented in simplified service');
    return { response: [] }; 
  }
  async getOdds(params) { 
    console.warn('Odds not yet implemented in simplified service');
    return { response: [] }; 
  }
  async getInjuries(params) { 
    console.warn('Injuries not yet implemented in simplified service');
    return { response: [] }; 
  }
  async getTransfers(params) { 
    console.warn('Transfers not yet implemented in simplified service');
    return { response: [] }; 
  }
  async getVenues(params) { 
    console.warn('Venues not yet implemented in simplified service');
    return { response: [] }; 
  }
  async getCoaches(params) { 
    console.warn('Coaches not yet implemented in simplified service');
    return { response: [] }; 
  }
  async getBookmakers() { 
    console.warn('Bookmakers not yet implemented in simplified service');
    return { response: [] }; 
  }
  async getTimezones() { 
    const timezones = [
      'UTC', 'Europe/London', 'Europe/Paris', 'Europe/Madrid', 'Europe/Rome',
      'America/New_York', 'America/Los_Angeles', 'America/Chicago', 'America/Denver',
      'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Australia/Sydney'
    ];
    return { response: timezones };
  }

  // Cache management
  clearAllCache() {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  // Initialize cache cleanup interval
  startCacheCleanup() {
    setInterval(() => {
      this.clearExpiredCache();
    }, 10 * 60 * 1000); // Clean every 10 minutes
  }
}

// Create singleton instance and start cache cleanup
export const apiFootball = new ApiFootballService();
apiFootball.startCacheCleanup();
export default apiFootball;