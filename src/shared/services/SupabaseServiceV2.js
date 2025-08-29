// ===============================================
// AREBET ENHANCED SUPABASE SERVICE V2
// 5-Day Sprint Version with Subscription Features
// ===============================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'placeholder-key'

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder')) {
  console.warn('⚠️  Using placeholder Supabase credentials. To connect to a real database, update your .env.local file with actual Supabase credentials.')
}

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    channels: {
      self: true,
    },
  },
})

// ===============================================
// ENHANCED SPORTS DATA SERVICE WITH SUBSCRIPTIONS
// ===============================================

class AreBetService {
  constructor() {
    this.client = supabase
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5 minutes
    this.pendingRequests = new Map() // Request deduplication
    this.requestTimeouts = new Map() // Debounce timeouts
    this.currentUser = null
    this.userTier = 'free'
    
    // Initialize user session
    this.initializeAuth()
    
    // Cleanup cache periodically
    setInterval(() => this.cleanupCache(), 60000) // Every minute
  }

  // Enhanced caching with expiration and cleanup
  cleanupCache() {
    const now = Date.now()
    for (const [key, data] of this.cache.entries()) {
      if (now - data.timestamp > this.cacheTimeout) {
        this.cache.delete(key)
      }
    }
  }

  // Request deduplication - prevent duplicate API calls
  async deduplicateRequest(key, requestFn) {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)
    }

    const promise = requestFn()
    this.pendingRequests.set(key, promise)
    
    try {
      const result = await promise
      return result
    } finally {
      this.pendingRequests.delete(key)
    }
  }

  // Debounced request execution
  debounceRequest(key, requestFn, delay = 300) {
    return new Promise((resolve, reject) => {
      // Clear existing timeout
      if (this.requestTimeouts.has(key)) {
        clearTimeout(this.requestTimeouts.get(key))
      }

      // Set new timeout
      const timeoutId = setTimeout(async () => {
        try {
          const result = await requestFn()
          resolve(result)
        } catch (error) {
          reject(error)
        } finally {
          this.requestTimeouts.delete(key)
        }
      }, delay)

      this.requestTimeouts.set(key, timeoutId)
    })
  }

  // ===============================================
  // AUTHENTICATION & SUBSCRIPTION MANAGEMENT
  // ===============================================

  async initializeAuth() {
    const { data: { user } } = await this.client.auth.getUser()
    this.currentUser = user
    
    if (user) {
      await this.loadUserProfile()
    }
    
    // Listen for auth changes
    this.client.auth.onAuthStateChange(async (event, session) => {
      this.currentUser = session?.user || null
      if (this.currentUser) {
        await this.loadUserProfile()
      } else {
        this.userTier = 'free'
      }
    })
  }

  async loadUserProfile() {
    if (!this.currentUser) return
    
    const { data: profile } = await this.client
      .from('profiles')
      .select('subscription_tier, subscription_status, api_quota_used, preferences')
      .eq('id', this.currentUser.id)
      .single()
    
    this.userTier = profile?.subscription_tier || 'free'
    this.userProfile = profile
  }

  async signUp(email, password, metadata = {}) {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    
    if (data.user && !error) {
      // Create user profile
      await this.client
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          subscription_tier: 'free',
          subscription_status: 'active',
          api_quota_used: 0,
          preferences: {},
          created_at: new Date().toISOString()
        })
    }
    
    return { data, error }
  }

  async signIn(email, password) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password
    })
    
    return { data, error }
  }

  async signOut() {
    const { error } = await this.client.auth.signOut()
    this.currentUser = null
    this.userTier = 'free'
    this.userProfile = null
    return { error }
  }

  // ===============================================
  // SUBSCRIPTION TIERS & FEATURE GATING
  // ===============================================

  getSubscriptionLimits() {
    const limits = {
      free: {
        apiQuota: 100,
        features: ['basic_scores', 'basic_fixtures', 'basic_standings'],
        realTime: false
      },
      pro: {
        apiQuota: 1000,
        features: ['predictions', 'advanced_stats', 'injury_insights', 'h2h_analysis'],
        realTime: true
      },
      elite: {
        apiQuota: 5000,
        features: ['value_bets', 'ai_predictions', 'historical_trends', 'custom_alerts'],
        realTime: true,
        priority: true
      }
    }
    
    return limits[this.userTier] || limits.free
  }

  hasFeatureAccess(feature) {
    const limits = this.getSubscriptionLimits()
    return limits.features.includes(feature)
  }

  async checkApiQuota() {
    if (!this.userProfile) return true
    
    const limits = this.getSubscriptionLimits()
    return this.userProfile.api_quota_used < limits.apiQuota
  }

  async incrementApiUsage() {
    if (!this.currentUser) return
    
    await this.client
      .from('profiles')
      .update({ api_quota_used: (this.userProfile?.api_quota_used || 0) + 1 })
      .eq('id', this.currentUser.id)
  }

  // ===============================================
  // ENHANCED DATA FETCHING WITH SUBSCRIPTION AWARENESS
  // ===============================================

  async getLiveFixtures() {
    return this.getFixtures({ live: true, limit: 30 })
  }

  async getFixtures(params = {}) {
    await this.incrementApiUsage()
    
    try {
      const { date, league, team, live, limit = 50, id } = params
      const cacheKey = this.getCacheKey('fixtures', params)
      const cached = this.getFromCache(cacheKey)
      if (cached) return { response: cached }

      let query = this.client
        .from('fixtures')
        .select(`
          *,
          home_team:teams!home_team_id(id, name, logo_url),
          away_team:teams!away_team_id(id, name, logo_url),
          league:leagues!league_id(id, name, logo_url, country_id)
        `)
        .order('date', { ascending: true })
        .limit(limit)

      // ID filtering for specific match
      if (id) {
        query = query.eq('id', id)
      }

      if (date && date !== 'all') {
        const startOfDay = `${date}T00:00:00`
        const endOfDay = `${date}T23:59:59`
        query = query.gte('date', startOfDay).lte('date', endOfDay)
      }

      if (league) query = query.eq('league_id', league)
      if (team) query = query.or(`home_team_id.eq.${team},away_team_id.eq.${team}`)
      if (live === 'true' || live === true) {
        query = query.in('status_short', ['1H', '2H', 'HT', 'ET', 'BT', 'P'])
      }

      const { data, error } = await query
      if (error) throw error

      // Transform to API-Football format
      const transformedData = data.map(fixture => ({
        fixture: {
          id: fixture.id,
          referee: fixture.referee,
          timezone: fixture.timezone,
          date: fixture.date,
          timestamp: fixture.timestamp,
          status: {
            long: fixture.status_long,
            short: fixture.status_short,
            elapsed: fixture.status_elapsed
          },
          venue: {
            id: fixture.venue?.id,
            name: fixture.venue?.name,
            city: fixture.venue?.city
          }
        },
        league: {
          id: fixture.league?.id,
          name: fixture.league?.name,
          logo: fixture.league?.logo_url,
          season: fixture.season,
          round: fixture.round
        },
        teams: {
          home: {
            id: fixture.home_team?.id,
            name: fixture.home_team?.name,
            logo: fixture.home_team?.logo_url
          },
          away: {
            id: fixture.away_team?.id,
            name: fixture.away_team?.name,
            logo: fixture.away_team?.logo_url
          }
        },
        goals: {
          home: fixture.home_goals,
          away: fixture.away_goals
        },
        // Add prediction data for premium users
        predictions: this.hasFeatureAccess('predictions') ? fixture.predictions : null
      }))

      this.setCache(cacheKey, transformedData)
      return { response: transformedData }

    } catch (error) {
      return this.handleError('fetch fixtures', error)
    }
  }

  async getEnhancedMatchData(matchId) {
    if (!this.hasFeatureAccess('advanced_stats')) {
      return { error: 'Premium feature - upgrade to access advanced match data' }
    }

    const cacheKey = this.getCacheKey('enhanced_match', { matchId })
    const cached = this.getFromCache(cacheKey)
    if (cached) return { response: cached }

    try {
      // Parallel fetch of enhanced data
      const [fixture, predictions, h2h, teamStats] = await Promise.all([
        this.getFixtures({ id: matchId }),
        this.getPredictions(matchId),
        this.getH2HAnalysis(matchId),
        this.getTeamStatistics(matchId)
      ])

      const enhancedData = {
        match: fixture.response?.[0],
        predictions: predictions.response?.[0],
        headToHead: h2h.response,
        teamStats: teamStats.response,
        confidence: this.calculatePredictionConfidence(predictions.response?.[0])
      }

      this.setCache(cacheKey, enhancedData)
      return { response: enhancedData }

    } catch (error) {
      return this.handleError('fetch enhanced match data', error)
    }
  }

  calculatePredictionConfidence(prediction) {
    if (!prediction) return null
    
    // Simple confidence calculation based on percentage spread
    const { home, draw, away } = prediction.percent
    const maxPercentage = Math.max(
      parseFloat(home), 
      parseFloat(draw), 
      parseFloat(away)
    )
    
    return {
      score: Math.round(maxPercentage),
      level: maxPercentage > 60 ? 'high' : maxPercentage > 40 ? 'medium' : 'low'
    }
  }

  // ===============================================
  // PREDICTION & ANALYTICS (PREMIUM FEATURES)
  // ===============================================

  async getPredictions(fixture) {
    if (!this.hasFeatureAccess('predictions')) {
      return { error: 'Premium feature - upgrade to Pro for predictions' }
    }

    await this.incrementApiUsage()
    
    try {
      const cacheKey = this.getCacheKey('predictions', { fixture })
      const cached = this.getFromCache(cacheKey)
      if (cached) return { response: cached }

      const { data, error } = await this.client
        .from('predictions')
        .select(`
          *,
          fixture:fixtures(
            id, home_team_id, away_team_id,
            home_team:teams!fixtures_home_team_id_fkey(id, name, logo_url),
            away_team:teams!fixtures_away_team_id_fkey(id, name, logo_url)
          )
        `)
        .eq('fixture_id', fixture)
        .single()

      if (error) throw error

      const transformedData = [{
        predictions: {
          winner: {
            id: data.winner_id,
            name: data.winner_id ? 
              (data.winner_id === data.fixture.home_team_id ? data.fixture.home_team.name : data.fixture.away_team.name) :
              'Draw',
            comment: data.winner_comment
          },
          win_or_draw: data.home_percentage + data.draw_percentage > data.away_percentage,
          under_over: data.under_over,
          goals: {
            home: data.goals_home.toString(),
            away: data.goals_away.toString()
          },
          advice: data.advice,
          percent: {
            home: `${data.home_percentage}%`,
            draw: `${data.draw_percentage}%`,
            away: `${data.away_percentage}%`
          }
        }
      }]

      this.setCache(cacheKey, transformedData)
      return { response: transformedData }

    } catch (error) {
      return this.handleError('fetch predictions', error)
    }
  }

  async getValueBets(params = {}) {
    if (!this.hasFeatureAccess('value_bets')) {
      return { error: 'Elite feature - upgrade to Elite for value bet analysis' }
    }

    // eslint-disable-next-line no-unused-vars
    const { league, date, minValue = 1.1 } = params
    
    try {
      // Complex value bet calculation would go here
      // For MVP, return mock data
      const mockValueBets = [
        {
          fixture_id: 123,
          match: 'Arsenal vs Chelsea',
          bet_type: 'Over 2.5 Goals',
          bookmaker_odds: 1.8,
          calculated_probability: 0.65,
          value_percentage: 17,
          confidence: 'high'
        }
      ]

      return { response: mockValueBets }
    } catch (error) {
      return this.handleError('fetch value bets', error)
    }
  }

  // ===============================================
  // HELPER METHODS
  // ===============================================

  getCacheKey(table, params = {}) {
    return `${table}_${JSON.stringify(params)}_${this.userTier}`
  }

  getFromCache(key) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }

  setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  async handleError(operation, error) {
    console.error(`${operation} error:`, error)
    
    // Return graceful fallbacks for free users
    if (this.userTier === 'free') {
      return { response: [], error: `${operation} failed - limited data available` }
    }
    
    throw new Error(`Failed to ${operation}: ${error.message}`)
  }

  // ===============================================
  // LEGACY COMPATIBILITY
  // ===============================================

  // Keep existing methods for compatibility
  async getStandings(league, season) {
    return this.getLeagueStandings(league, season)
  }

  async getLeagueStandings(league, season) {
    await this.incrementApiUsage()
    
    try {
      const { data, error } = await this.client
        .from('standings')
        .select(`
          *,
          team:teams(id, name, logo_url)
        `)
        .eq('league_id', league)
        .eq('season', season)
        .order('rank')

      if (error) throw error

      const transformedData = [{
        league: {
          id: league,
          season: season,
          standings: [
            data.map(standing => ({
              rank: standing.rank,
              team: {
                id: standing.team.id,
                name: standing.team.name,
                logo: standing.team.logo_url
              },
              points: standing.points,
              goalsDiff: standing.goals_diff,
              form: standing.form,
              all: {
                played: standing.played,
                win: standing.win,
                draw: standing.draw,
                lose: standing.lose,
                goals: {
                  for: standing.goals_for,
                  against: standing.goals_against
                }
              }
            }))
          ]
        }
      }]

      return { response: transformedData }
    } catch (error) {
      return this.handleError('fetch standings', error)
    }
  }
}

// Create singleton instance
export const areBetService = new AreBetService()
export default areBetService