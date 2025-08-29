// ===============================================
// SUPABASE CLIENT SERVICE
// Replaces the API-Football service with Supabase integration
// ===============================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'placeholder-key'

// Check if we have valid Supabase credentials
const hasValidCredentials = supabaseUrl !== 'https://placeholder.supabase.co' && 
                           supabaseAnonKey !== 'placeholder-key'

if (!hasValidCredentials) {
  console.warn('⚠️ Missing or invalid Supabase environment variables. The app will run with mock data.')
  console.warn('To fix this, create a .env.local file with:')
  console.warn('REACT_APP_SUPABASE_URL=your_supabase_url')
  console.warn('REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key')
}

// Initialize Supabase client
export const supabase = hasValidCredentials ? createClient(supabaseUrl, supabaseAnonKey, {
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
}) : null

// ===============================================
// SPORTS DATA SERVICE
// All API calls now go through Supabase instead of API-Football
// ===============================================

class SupabaseService {
  constructor() {
    this.client = supabase
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5 minutes
    this.insightsCacheTimeout = 10 * 60 * 1000 // 10 minutes for insights (longer cache)
    this.performanceCache = new Map() // Separate cache for heavy computations
  }

  // ===============================================
  // HELPER METHODS
  // ===============================================

  getCacheKey(table, params = {}) {
    return `${table}_${JSON.stringify(params)}`
  }

  getFromCache(key, useInsightsTimeout = false) {
    const cached = this.cache.get(key)
    const timeout = useInsightsTimeout ? this.insightsCacheTimeout : this.cacheTimeout
    if (cached && Date.now() - cached.timestamp < timeout) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }
  
  getFromPerformanceCache(key) {
    const cached = this.performanceCache.get(key)
    if (cached && Date.now() - cached.timestamp < this.insightsCacheTimeout) {
      return cached.data
    }
    this.performanceCache.delete(key)
    return null
  }
  
  setPerformanceCache(key, data) {
    this.performanceCache.set(key, { data, timestamp: Date.now() })
  }

  setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  clearCache() {
    this.cache.clear()
  }

  async handleError(operation, error) {
    console.error(`${operation} error:`, error)
    throw new Error(`Failed to ${operation}: ${error.message}`)
  }

  // ===============================================
  // FIXTURES & MATCHES
  // ===============================================

  async getFixtures(params = {}) {
    try {
      const { date, league, team, live, limit = 100 } = params
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

      if (date && date !== 'all') {
        const startOfDay = `${date}T00:00:00`
        const endOfDay = `${date}T23:59:59`
        query = query.gte('date', startOfDay).lte('date', endOfDay)
      }

      if (league) {
        query = query.eq('league_id', league)
      }

      if (team) {
        query = query.or(`home_team_id.eq.${team},away_team_id.eq.${team}`)
      }

      if (live === 'true' || live === true) {
        query = query.in('status_short', ['1H', '2H', 'HT', 'ET', 'BT', 'P'])
      }

      const { data, error } = await query

      if (error) throw error

      // Transform to match API-Football format
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
        score: {
          halftime: {
            home: fixture.home_goals_halftime,
            away: fixture.away_goals_halftime
          },
          fulltime: {
            home: fixture.home_goals,
            away: fixture.away_goals
          },
          extratime: {
            home: fixture.home_goals_extratime,
            away: fixture.away_goals_extratime
          },
          penalty: {
            home: fixture.home_goals_penalty,
            away: fixture.away_goals_penalty
          }
        }
      }))

      this.setCache(cacheKey, transformedData)
      return { response: transformedData }

    } catch (error) {
      await this.handleError('fetch fixtures', error)
    }
  }

  async getLiveFixtures() {
    return this.getFixtures({ live: true })
  }

  async getFixturesByDate(date) {
    return this.getFixtures({ date })
  }

  async getFixturesByLeague(league, season) {
    return this.getFixtures({ league, season })
  }

  async getFixturesByTeam(team, season) {
    return this.getFixtures({ team, season })
  }

  // ===============================================
  // STANDINGS
  // ===============================================

  async getStandings(league, season) {
    try {
      const cacheKey = this.getCacheKey('standings', { league, season })
      const cached = this.getFromCache(cacheKey)
      if (cached) return { response: cached }

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

      // Transform to match API-Football format
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
              group: standing.group_name,
              form: standing.form,
              status: standing.status,
              description: standing.description,
              all: {
                played: standing.played,
                win: standing.win,
                draw: standing.draw,
                lose: standing.lose,
                goals: {
                  for: standing.goals_for,
                  against: standing.goals_against
                }
              },
              home: {
                played: standing.home_played,
                win: standing.home_win,
                draw: standing.home_draw,
                lose: standing.home_lose,
                goals: {
                  for: standing.home_goals_for,
                  against: standing.home_goals_against
                }
              },
              away: {
                played: standing.away_played,
                win: standing.away_win,
                draw: standing.away_draw,
                lose: standing.away_lose,
                goals: {
                  for: standing.away_goals_for,
                  against: standing.away_goals_against
                }
              }
            }))
          ]
        }
      }]

      this.setCache(cacheKey, transformedData)
      return { response: transformedData }

    } catch (error) {
      await this.handleError('fetch standings', error)
    }
  }

  // ===============================================
  // TEAMS
  // ===============================================

  async getTeams(params = {}) {
    try {
      const { league, season, search } = params
      const cacheKey = this.getCacheKey('teams', params)
      const cached = this.getFromCache(cacheKey)
      if (cached) return { response: cached }

      let query = this.client
        .from('teams')
        .select(`
          *,
          country:countries(id, name, flag_url)
        `)
        .order('name')

      if (search) {
        query = query.ilike('name', `%${search}%`)
      }

      // If league specified, get teams from standings or team_squads
      if (league && season) {
        const { data: standingTeams } = await this.client
          .from('standings')
          .select('team_id')
          .eq('league_id', league)
          .eq('season', season)

        if (standingTeams && standingTeams.length > 0) {
          const teamIds = standingTeams.map(s => s.team_id)
          query = query.in('id', teamIds)
        }
      }

      const { data, error } = await query

      if (error) throw error

      // Transform to match API-Football format
      const transformedData = data.map(team => ({
        team: {
          id: team.id,
          name: team.name,
          code: team.tla,
          country: team.country?.name,
          founded: team.founded_year,
          national: team.national,
          logo: team.logo_url
        },
        venue: {
          id: team.venue?.id,
          name: team.venue?.name,
          address: team.venue?.address,
          city: team.venue?.city,
          capacity: team.venue?.capacity,
          surface: team.venue?.surface,
          image: team.venue?.image_url
        }
      }))

      this.setCache(cacheKey, transformedData)
      return { response: transformedData }

    } catch (error) {
      await this.handleError('fetch teams', error)
    }
  }

  async getTeamsByLeague(league, season) {
    return this.getTeams({ league, season })
  }

  async getTeamStatistics(team, league, season) {
    try {
      const cacheKey = this.getCacheKey('team_statistics', { team, league, season })
      const cached = this.getFromCache(cacheKey)
      if (cached) return { response: cached }

      const { data, error } = await this.client
        .from('team_statistics')
        .select('*')
        .eq('team_id', team)
        .eq('league_id', league)
        .eq('season', season)
        .single()

      if (error) throw error

      // Transform to match API-Football format
      const transformedData = {
        league: { id: league, season },
        team: { id: team },
        form: data.form,
        fixtures: {
          played: { home: data.played_home, away: data.played_away },
          wins: { home: data.wins_home, away: data.wins_away },
          draws: { home: data.draws_home, away: data.draws_away },
          loses: { home: data.loses_home, away: data.loses_away }
        },
        goals: {
          for: {
            total: data.goals_for_total,
            average: data.goals_for_average,
            home: data.goals_for_home,
            away: data.goals_for_away
          },
          against: {
            total: data.goals_against_total,
            average: data.goals_against_average,
            home: data.goals_against_home,
            away: data.goals_against_away
          }
        },
        clean_sheet: {
          home: data.clean_sheets_home,
          away: data.clean_sheets_away,
          total: data.clean_sheets_total
        },
        failed_to_score: {
          home: data.failed_to_score_home,
          away: data.failed_to_score_away,
          total: data.failed_to_score_total
        }
      }

      this.setCache(cacheKey, transformedData)
      return { response: transformedData }

    } catch (error) {
      await this.handleError('fetch team statistics', error)
    }
  }

  // ===============================================
  // PLAYERS
  // ===============================================

  async getSquads(team) {
    try {
      const cacheKey = this.getCacheKey('squads', { team })
      const cached = this.getFromCache(cacheKey)
      if (cached) return { response: cached }

      const { data, error } = await this.client
        .from('team_squads')
        .select(`
          *,
          player:players(id, name, age, nationality, photo_url, position)
        `)
        .eq('team_id', team)
        .order('number')

      if (error) throw error

      // Transform to match API-Football format
      const transformedData = [{
        team: { id: team },
        players: data.map(squad => ({
          id: squad.player.id,
          name: squad.player.name,
          age: squad.player.age,
          number: squad.number,
          position: squad.position,
          photo: squad.player.photo_url
        }))
      }]

      this.setCache(cacheKey, transformedData)
      return { response: transformedData }

    } catch (error) {
      await this.handleError('fetch squads', error)
    }
  }

  async getTopScorers(league, season) {
    try {
      const cacheKey = this.getCacheKey('top_scorers', { league, season })
      const cached = this.getFromCache(cacheKey)
      if (cached) return { response: cached }

      const { data, error } = await this.client
        .from('player_statistics')
        .select(`
          *,
          player:players(id, name, photo_url),
          team:teams(id, name, logo_url)
        `)
        .eq('league_id', league)
        .eq('season', season)
        .gt('goals', 0)
        .order('goals', { ascending: false })
        .limit(20)

      if (error) throw error

      // Transform to match API-Football format
      const transformedData = data.map(stat => ({
        player: {
          id: stat.player.id,
          name: stat.player.name,
          photo: stat.player.photo_url
        },
        statistics: [{
          team: {
            id: stat.team.id,
            name: stat.team.name,
            logo: stat.team.logo_url
          },
          league: { id: league, season },
          games: { appearances: stat.appearances },
          goals: { total: stat.goals },
          assists: { total: stat.assists }
        }]
      }))

      this.setCache(cacheKey, transformedData)
      return { response: transformedData }

    } catch (error) {
      await this.handleError('fetch top scorers', error)
    }
  }

  async getTopAssists(league, season) {
    try {
      const cacheKey = this.getCacheKey('top_assists', { league, season })
      const cached = this.getFromCache(cacheKey)
      if (cached) return { response: cached }

      const { data, error } = await this.client
        .from('player_statistics')
        .select(`
          *,
          player:players(id, name, photo_url),
          team:teams(id, name, logo_url)
        `)
        .eq('league_id', league)
        .eq('season', season)
        .gt('assists', 0)
        .order('assists', { ascending: false })
        .limit(20)

      if (error) throw error

      const transformedData = data.map(stat => ({
        player: {
          id: stat.player.id,
          name: stat.player.name,
          photo: stat.player.photo_url
        },
        statistics: [{
          team: {
            id: stat.team.id,
            name: stat.team.name,
            logo: stat.team.logo_url
          },
          league: { id: league, season },
          games: { appearances: stat.appearances },
          goals: { total: stat.goals },
          assists: { total: stat.assists }
        }]
      }))

      this.setCache(cacheKey, transformedData)
      return { response: transformedData }

    } catch (error) {
      await this.handleError('fetch top assists', error)
    }
  }

  async getTopYellowCards(league, season) {
    try {
      const cacheKey = this.getCacheKey('top_yellow_cards', { league, season })
      const cached = this.getFromCache(cacheKey)
      if (cached) return { response: cached }

      const { data, error } = await this.client
        .from('player_statistics')
        .select(`
          *,
          player:players(id, name, photo_url),
          team:teams(id, name, logo_url)
        `)
        .eq('league_id', league)
        .eq('season', season)
        .gt('yellow_cards', 0)
        .order('yellow_cards', { ascending: false })
        .limit(20)

      if (error) throw error

      const transformedData = data.map(stat => ({
        player: {
          id: stat.player.id,
          name: stat.player.name,
          photo: stat.player.photo_url
        },
        statistics: [{
          team: {
            id: stat.team.id,
            name: stat.team.name,
            logo: stat.team.logo_url
          },
          league: { id: league, season },
          games: { appearances: stat.appearances },
          cards: { yellow: stat.yellow_cards, red: stat.red_cards }
        }]
      }))

      this.setCache(cacheKey, transformedData)
      return { response: transformedData }

    } catch (error) {
      await this.handleError('fetch top yellow cards', error)
    }
  }

  async getTopRedCards(league, season) {
    try {
      const cacheKey = this.getCacheKey('top_red_cards', { league, season })
      const cached = this.getFromCache(cacheKey)
      if (cached) return { response: cached }

      const { data, error } = await this.client
        .from('player_statistics')
        .select(`
          *,
          player:players(id, name, photo_url),
          team:teams(id, name, logo_url)
        `)
        .eq('league_id', league)
        .eq('season', season)
        .gt('red_cards', 0)
        .order('red_cards', { ascending: false })
        .limit(20)

      if (error) throw error

      const transformedData = data.map(stat => ({
        player: {
          id: stat.player.id,
          name: stat.player.name,
          photo: stat.player.photo_url
        },
        statistics: [{
          team: {
            id: stat.team.id,
            name: stat.team.name,
            logo: stat.team.logo_url
          },
          league: { id: league, season },
          games: { appearances: stat.appearances },
          cards: { yellow: stat.yellow_cards, red: stat.red_cards }
        }]
      }))

      this.setCache(cacheKey, transformedData)
      return { response: transformedData }

    } catch (error) {
      await this.handleError('fetch top red cards', error)
    }
  }

  async getPlayers(params = {}) {
    try {
      const { team, league, season, search, page = 1 } = params
      const cacheKey = this.getCacheKey('players', params)
      const cached = this.getFromCache(cacheKey)
      if (cached) return { response: cached }

      let query = this.client
        .from('players')
        .select(`
          *,
          statistics:player_statistics(
            team_id,
            league_id,
            season,
            goals,
            assists,
            appearances
          ),
          team:player_statistics!inner(
            team:teams(id, name, logo_url)
          )
        `)
        .order('name')
        .range((page - 1) * 50, page * 50 - 1)

      if (team) {
        query = query.eq('team_statistics.team_id', team)
      }

      if (league && season) {
        query = query.eq('team_statistics.league_id', league)
        query = query.eq('team_statistics.season', season)
      }

      if (search) {
        query = query.ilike('name', `%${search}%`)
      }

      const { data, error } = await query

      if (error) throw error

      const transformedData = data.map(player => ({
        player: {
          id: player.id,
          name: player.name,
          firstname: player.firstname,
          lastname: player.lastname,
          age: player.age,
          birth: {
            date: player.birth_date,
            place: player.birth_place,
            country: player.nationality
          },
          nationality: player.nationality,
          height: player.height,
          weight: player.weight,
          injured: false,
          photo: player.photo_url
        },
        statistics: player.statistics || []
      }))

      this.setCache(cacheKey, transformedData)
      return { response: transformedData }

    } catch (error) {
      await this.handleError('fetch players', error)
    }
  }

  // ===============================================
  // LEAGUES
  // ===============================================

  async getLeagues(params = {}) {
    try {
      const { id, current, search } = params
      const cacheKey = this.getCacheKey('leagues', params)
      const cached = this.getFromCache(cacheKey)
      if (cached) return { response: cached }

      let query = this.client
        .from('leagues')
        .select(`
          *,
          country:countries(id, name, flag_url)
        `)
        .order('name')

      if (id) {
        query = query.eq('id', id)
      }

      if (current) {
        query = query.not('current_season', 'is', null)
      }

      if (search) {
        query = query.ilike('name', `%${search}%`)
      }

      const { data, error } = await query

      if (error) throw error

      // Transform to match API-Football format
      const transformedData = data.map(league => ({
        league: {
          id: league.id,
          name: league.name,
          type: league.type,
          logo: league.logo_url
        },
        country: {
          name: league.country?.name,
          code: league.country?.code,
          flag: league.country?.flag_url
        },
        seasons: [{
          year: league.current_season,
          start: league.start_date,
          end: league.end_date,
          current: true
        }]
      }))

      this.setCache(cacheKey, transformedData)
      return { response: transformedData }

    } catch (error) {
      await this.handleError('fetch leagues', error)
    }
  }

  async getSeasons() {
    try {
      const cacheKey = this.getCacheKey('seasons', {})
      const cached = this.getFromCache(cacheKey)
      if (cached) return { response: cached }

      // Return common seasons from current year back to 2015
      const currentYear = new Date().getFullYear()
      const seasons = []
      for (let year = currentYear; year >= 2015; year--) {
        seasons.push(year)
      }

      this.setCache(cacheKey, seasons)
      return { response: seasons }

    } catch (error) {
      await this.handleError('fetch seasons', error)
    }
  }

  async getCountries() {
    try {
      const cacheKey = this.getCacheKey('countries', {})
      const cached = this.getFromCache(cacheKey)
      if (cached) return { response: cached }

      const { data, error } = await this.client
        .from('countries')
        .select('*')
        .order('name')

      if (error) throw error

      const transformedData = data.map(country => ({
        name: country.name,
        code: country.code,
        flag: country.flag_url
      }))

      this.setCache(cacheKey, transformedData)
      return { response: transformedData }

    } catch (error) {
      await this.handleError('fetch countries', error)
    }
  }

  // ===============================================
  // PREDICTIONS
  // ===============================================

  async getPredictions(fixture) {
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

      // Transform to match API-Football format
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
        },
        comparison: {
          form: { home: `${data.home_att_strength}%`, away: `${data.away_att_strength}%` },
          att: { home: `${data.home_att_strength}%`, away: `${data.away_att_strength}%` },
          def: { home: `${data.home_def_strength}%`, away: `${data.away_def_strength}%` },
          poisson_distribution: { 
            home: data.home_poisson_distribution.toString(), 
            away: data.away_poisson_distribution.toString() 
          }
        }
      }]

      this.setCache(cacheKey, transformedData)
      return { response: transformedData }

    } catch (error) {
      // If no predictions found, trigger sync
      if (error.code === 'PGRST116') {
        await this.syncPredictions(fixture)
        // Retry after sync
        return this.getPredictions(fixture)
      }
      await this.handleError('fetch predictions', error)
    }
  }

  // ===============================================
  // DATA SYNC METHODS
  // ===============================================

  async syncFixtures(params = {}) {
    try {
      const { date, league, team, live } = params
      const searchParams = new URLSearchParams()
      
      if (date) searchParams.append('date', date)
      if (league) searchParams.append('league', league)
      if (team) searchParams.append('team', team)
      if (live) searchParams.append('live', 'true')

      const response = await fetch(`${supabaseUrl}/functions/v1/sync-fixtures?${searchParams}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      // Clear relevant cache
      this.cache.forEach((value, key) => {
        if (key.includes('fixtures')) {
          this.cache.delete(key)
        }
      })

      return result

    } catch (error) {
      console.error('Sync fixtures error:', error)
      throw error
    }
  }

  async syncStandings(league, season) {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/sync-standings?league=${league}&season=${season}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      // Clear standings cache
      this.cache.forEach((value, key) => {
        if (key.includes('standings')) {
          this.cache.delete(key)
        }
      })

      return result

    } catch (error) {
      console.error('Sync standings error:', error)
      throw error
    }
  }

  async syncPredictions(fixture) {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/sync-predictions?fixture=${fixture}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      // Clear predictions cache
      this.cache.forEach((value, key) => {
        if (key.includes('predictions')) {
          this.cache.delete(key)
        }
      })

      return result

    } catch (error) {
      console.error('Sync predictions error:', error)
      throw error
    }
  }

  async syncTeams(league, season) {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/sync-teams?league=${league}&season=${season}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      this.cache.forEach((value, key) => {
        if (key.includes('teams')) {
          this.cache.delete(key)
        }
      })

      return result
    } catch (error) {
      console.error('Sync teams error:', error)
      throw error
    }
  }

  async syncPlayers(team, league, season) {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/sync-players?team=${team}&league=${league}&season=${season}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      this.cache.forEach((value, key) => {
        if (key.includes('players') || key.includes('squads') || key.includes('top_')) {
          this.cache.delete(key)
        }
      })

      return result
    } catch (error) {
      console.error('Sync players error:', error)
      throw error
    }
  }

  async syncOdds(fixture) {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/sync-odds?fixture=${fixture}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      this.cache.forEach((value, key) => {
        if (key.includes('odds')) {
          this.cache.delete(key)
        }
      })

      return result
    } catch (error) {
      console.error('Sync odds error:', error)
      throw error
    }
  }

  async syncInjuries(team) {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/sync-injuries?team=${team}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      this.cache.forEach((value, key) => {
        if (key.includes('injuries')) {
          this.cache.delete(key)
        }
      })

      return result
    } catch (error) {
      console.error('Sync injuries error:', error)
      throw error
    }
  }

  async syncTransfers(team) {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/sync-transfers?team=${team}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      this.cache.forEach((value, key) => {
        if (key.includes('transfers')) {
          this.cache.delete(key)
        }
      })

      return result
    } catch (error) {
      console.error('Sync transfers error:', error)
      throw error
    }
  }

  async syncVenues() {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/sync-venues`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      this.cache.forEach((value, key) => {
        if (key.includes('venues')) {
          this.cache.delete(key)
        }
      })

      return result
    } catch (error) {
      console.error('Sync venues error:', error)
      throw error
    }
  }

  async syncLeagues() {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/sync-leagues`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      this.cache.forEach((value, key) => {
        if (key.includes('leagues')) {
          this.cache.delete(key)
        }
      })

      return result
    } catch (error) {
      console.error('Sync leagues error:', error)
      throw error
    }
  }

  async syncAllData(params = {}) {
    try {
      const { league = 39, season = 2024 } = params
      
      // Sync in parallel for better performance
      await Promise.allSettled([
        this.syncLeagues(),
        this.syncTeams(league, season),
        this.syncStandings(league, season),
        this.syncFixtures({ league }),
        this.syncVenues()
      ])

      return { success: true, message: 'All data sync initiated' }
    } catch (error) {
      console.error('Sync all data error:', error)
      throw error
    }
  }

  // ===============================================
  // INJURIES & TRANSFERS
  // ===============================================

  async getInjuries(params = {}) {
    try {
      const { league, team, player, fixture } = params
      const cacheKey = this.getCacheKey('injuries', params)
      const cached = this.getFromCache(cacheKey)
      if (cached) return { response: cached }

      let query = this.client
        .from('injuries')
        .select(`
          *,
          player:players(id, name, photo_url),
          team:teams(id, name, logo_url),
          fixture:fixtures(id, date, status_short)
        `)
        .order('date', { ascending: false })
        .limit(50)

      if (league) query = query.eq('league_id', league)
      if (team) query = query.eq('team_id', team)
      if (player) query = query.eq('player_id', player)
      if (fixture) query = query.eq('fixture_id', fixture)

      const { data, error } = await query

      if (error) throw error

      const transformedData = data.map(injury => ({
        player: {
          id: injury.player.id,
          name: injury.player.name,
          photo: injury.player.photo_url
        },
        team: {
          id: injury.team.id,
          name: injury.team.name,
          logo: injury.team.logo_url
        },
        fixture: injury.fixture ? {
          id: injury.fixture.id,
          date: injury.fixture.date
        } : null,
        league: { id: injury.league_id },
        type: injury.type,
        reason: injury.reason,
        date: injury.date
      }))

      this.setCache(cacheKey, transformedData)
      return { response: transformedData }

    } catch (error) {
      await this.handleError('fetch injuries', error)
    }
  }

  async getTransfers(params = {}) {
    try {
      const { team, player } = params
      const cacheKey = this.getCacheKey('transfers', params)
      const cached = this.getFromCache(cacheKey)
      if (cached) return { response: cached }

      let query = this.client
        .from('transfers')
        .select(`
          *,
          player:players(id, name, photo_url),
          team_from:teams!transfers_team_from_id_fkey(id, name, logo_url),
          team_to:teams!transfers_team_to_id_fkey(id, name, logo_url)
        `)
        .order('date', { ascending: false })
        .limit(50)

      if (team) {
        query = query.or(`team_from_id.eq.${team},team_to_id.eq.${team}`)
      }
      if (player) query = query.eq('player_id', player)

      const { data, error } = await query

      if (error) throw error

      const transformedData = data.map(transfer => ({
        player: {
          id: transfer.player.id,
          name: transfer.player.name,
          photo: transfer.player.photo_url
        },
        update: transfer.date,
        transfers: [{
          date: transfer.date,
          type: transfer.type,
          teams: {
            in: {
              id: transfer.team_to?.id,
              name: transfer.team_to?.name,
              logo: transfer.team_to?.logo_url
            },
            out: {
              id: transfer.team_from?.id,
              name: transfer.team_from?.name,
              logo: transfer.team_from?.logo_url
            }
          }
        }]
      }))

      this.setCache(cacheKey, transformedData)
      return { response: transformedData }

    } catch (error) {
      await this.handleError('fetch transfers', error)
    }
  }

  // ===============================================
  // ODDS & BETTING
  // ===============================================

  async getOdds(params = {}) {
    try {
      const { fixture, league, bet } = params
      const cacheKey = this.getCacheKey('odds', params)
      const cached = this.getFromCache(cacheKey)
      if (cached) return { response: cached }

      let query = this.client
        .from('odds')
        .select(`
          *,
          fixture:fixtures(
            id, date,
            home_team:teams!fixtures_home_team_id_fkey(name, logo_url),
            away_team:teams!fixtures_away_team_id_fkey(name, logo_url)
          ),
          bookmaker:bookmakers(id, name)
        `)
        .order('fixture_id')
        .limit(100)

      if (fixture) query = query.eq('fixture_id', fixture)
      if (league) query = query.eq('league_id', league)
      if (bet) query = query.eq('bet_type', bet)

      const { data, error } = await query

      if (error) throw error

      const transformedData = data.map(odd => ({
        fixture: {
          id: odd.fixture.id,
          date: odd.fixture.date
        },
        league: { id: odd.league_id },
        teams: {
          home: odd.fixture.home_team,
          away: odd.fixture.away_team
        },
        bookmakers: [{
          id: odd.bookmaker.id,
          name: odd.bookmaker.name,
          bets: [{
            id: odd.bet_type,
            name: odd.bet_name,
            values: [
              { value: '1', odd: odd.home_odds?.toString() || '0' },
              { value: 'X', odd: odd.draw_odds?.toString() || '0' },
              { value: '2', odd: odd.away_odds?.toString() || '0' }
            ]
          }]
        }]
      }))

      this.setCache(cacheKey, transformedData)
      return { response: transformedData }

    } catch (error) {
      await this.handleError('fetch odds', error)
    }
  }

  async getBookmakers() {
    try {
      const cacheKey = this.getCacheKey('bookmakers', {})
      const cached = this.getFromCache(cacheKey)
      if (cached) return { response: cached }

      const { data, error } = await this.client
        .from('bookmakers')
        .select('*')
        .order('name')

      if (error) throw error

      const transformedData = data.map(bookmaker => ({
        id: bookmaker.id,
        name: bookmaker.name
      }))

      this.setCache(cacheKey, transformedData)
      return { response: transformedData }

    } catch (error) {
      await this.handleError('fetch bookmakers', error)
    }
  }

  // ===============================================
  // VENUES & COACHES
  // ===============================================

  async getVenues(params = {}) {
    try {
      const { id, name, city, country } = params
      const cacheKey = this.getCacheKey('venues', params)
      const cached = this.getFromCache(cacheKey)
      if (cached) return { response: cached }

      let query = this.client
        .from('venues')
        .select(`
          *,
          country:countries(name, flag_url)
        `)
        .order('name')
        .limit(50)

      if (id) query = query.eq('id', id)
      if (name) query = query.ilike('name', `%${name}%`)
      if (city) query = query.ilike('city', `%${city}%`)
      if (country) query = query.eq('country_id', country)

      const { data, error } = await query

      if (error) throw error

      const transformedData = data.map(venue => ({
        id: venue.id,
        name: venue.name,
        address: venue.address,
        city: venue.city,
        country: venue.country?.name,
        capacity: venue.capacity,
        surface: venue.surface,
        image: venue.image_url
      }))

      this.setCache(cacheKey, transformedData)
      return { response: transformedData }

    } catch (error) {
      await this.handleError('fetch venues', error)
    }
  }

  async getCoaches(params = {}) {
    try {
      const { id, team, search } = params
      const cacheKey = this.getCacheKey('coaches', params)
      const cached = this.getFromCache(cacheKey)
      if (cached) return { response: cached }

      let query = this.client
        .from('coaches')
        .select(`
          *,
          team:teams(id, name, logo_url)
        `)
        .order('name')

      if (id) query = query.eq('id', id)
      if (team) query = query.eq('team_id', team)
      if (search) query = query.ilike('name', `%${search}%`)

      const { data, error } = await query

      if (error) throw error

      const transformedData = data.map(coach => ({
        id: coach.id,
        name: coach.name,
        firstname: coach.firstname,
        lastname: coach.lastname,
        age: coach.age,
        birth: {
          date: coach.birth_date,
          place: coach.birth_place,
          country: coach.nationality
        },
        nationality: coach.nationality,
        height: coach.height,
        weight: coach.weight,
        photo: coach.photo_url,
        team: coach.team,
        career: coach.career || []
      }))

      this.setCache(cacheKey, transformedData)
      return { response: transformedData }

    } catch (error) {
      await this.handleError('fetch coaches', error)
    }
  }

  // ===============================================
  // FIXTURE DETAILS
  // ===============================================

  async getFixtureEvents(fixture) {
    try {
      const cacheKey = this.getCacheKey('fixture_events', { fixture })
      const cached = this.getFromCache(cacheKey)
      if (cached) return { response: cached }

      const { data, error } = await this.client
        .from('fixture_events')
        .select(`
          *,
          player:players(id, name),
          assist:players!fixture_events_assist_id_fkey(id, name),
          team:teams(id, name, logo_url)
        `)
        .eq('fixture_id', fixture)
        .order('time_elapsed')

      if (error) throw error

      const transformedData = data.map(event => ({
        time: {
          elapsed: event.time_elapsed,
          extra: event.time_extra
        },
        team: {
          id: event.team.id,
          name: event.team.name,
          logo: event.team.logo_url
        },
        player: event.player ? {
          id: event.player.id,
          name: event.player.name
        } : null,
        assist: event.assist ? {
          id: event.assist.id,
          name: event.assist.name
        } : null,
        type: event.type,
        detail: event.detail,
        comments: event.comments
      }))

      this.setCache(cacheKey, transformedData)
      return { response: transformedData }

    } catch (error) {
      await this.handleError('fetch fixture events', error)
    }
  }

  async getFixtureLineups(fixture) {
    try {
      const cacheKey = this.getCacheKey('fixture_lineups', { fixture })
      const cached = this.getFromCache(cacheKey)
      if (cached) return { response: cached }

      const { data, error } = await this.client
        .from('fixture_lineups')
        .select(`
          *,
          player:players(id, name, number, position),
          team:teams(id, name, logo_url),
          coach:coaches(id, name, photo_url)
        `)
        .eq('fixture_id', fixture)
        .order('team_id')

      if (error) throw error

      // Group by team
      const teamLineups = {}
      data.forEach(lineup => {
        const teamId = lineup.team.id
        if (!teamLineups[teamId]) {
          teamLineups[teamId] = {
            team: lineup.team,
            coach: lineup.coach,
            formation: lineup.formation,
            startXI: [],
            substitutes: []
          }
        }

        const playerData = {
          player: lineup.player,
          grid: lineup.grid_position
        }

        if (lineup.starting_xi) {
          teamLineups[teamId].startXI.push(playerData)
        } else {
          teamLineups[teamId].substitutes.push(playerData)
        }
      })

      const transformedData = Object.values(teamLineups)

      this.setCache(cacheKey, transformedData)
      return { response: transformedData }

    } catch (error) {
      await this.handleError('fetch fixture lineups', error)
    }
  }

  async getFixtureStatistics(fixture) {
    try {
      const cacheKey = this.getCacheKey('fixture_statistics', { fixture })
      const cached = this.getFromCache(cacheKey)
      if (cached) return { response: cached }

      const { data, error } = await this.client
        .from('fixture_statistics')
        .select(`
          *,
          team:teams(id, name, logo_url)
        `)
        .eq('fixture_id', fixture)
        .order('team_id')

      if (error) throw error

      const transformedData = data.map(stat => ({
        team: stat.team,
        statistics: [
          { type: 'Shots on Goal', value: stat.shots_on_goal?.toString() || '0' },
          { type: 'Shots off Goal', value: stat.shots_off_goal?.toString() || '0' },
          { type: 'Total Shots', value: stat.total_shots?.toString() || '0' },
          { type: 'Blocked Shots', value: stat.blocked_shots?.toString() || '0' },
          { type: 'Shots insidebox', value: stat.shots_inside_box?.toString() || '0' },
          { type: 'Shots outsidebox', value: stat.shots_outside_box?.toString() || '0' },
          { type: 'Fouls', value: stat.fouls?.toString() || '0' },
          { type: 'Corner Kicks', value: stat.corner_kicks?.toString() || '0' },
          { type: 'Offsides', value: stat.offsides?.toString() || '0' },
          { type: 'Ball Possession', value: `${stat.ball_possession || 0}%` },
          { type: 'Yellow Cards', value: stat.yellow_cards?.toString() || '0' },
          { type: 'Red Cards', value: stat.red_cards?.toString() || '0' },
          { type: 'Goalkeeper Saves', value: stat.goalkeeper_saves?.toString() || '0' },
          { type: 'Total passes', value: stat.total_passes?.toString() || '0' },
          { type: 'Passes accurate', value: stat.passes_accurate?.toString() || '0' },
          { type: 'Passes %', value: `${stat.passes_percentage || 0}%` }
        ]
      }))

      this.setCache(cacheKey, transformedData)
      return { response: transformedData }

    } catch (error) {
      await this.handleError('fetch fixture statistics', error)
    }
  }

  async getFixtureRounds(league, season) {
    try {
      const cacheKey = this.getCacheKey('fixture_rounds', { league, season })
      const cached = this.getFromCache(cacheKey)
      if (cached) return { response: cached }

      const { data, error } = await this.client
        .from('fixtures')
        .select('round')
        .eq('league_id', league)
        .eq('season', season)
        .not('round', 'is', null)

      if (error) throw error

      const uniqueRounds = [...new Set(data.map(d => d.round))].sort()

      this.setCache(cacheKey, uniqueRounds)
      return { response: uniqueRounds }

    } catch (error) {
      await this.handleError('fetch fixture rounds', error)
    }
  }

  // ===============================================
  // COMPATIBILITY & UTILITY METHODS
  // ===============================================

  async getHeadToHead(h2h) {
    const [homeTeam, awayTeam] = h2h.split('-').map(id => parseInt(id))
    
    return this.getH2HAnalysis(homeTeam, awayTeam, 10)
  }

  async getTimezones() {
    // Return common timezones
    const timezones = [
      'UTC', 'Europe/London', 'Europe/Paris', 'Europe/Madrid', 'Europe/Rome',
      'America/New_York', 'America/Los_Angeles', 'America/Chicago', 'America/Denver',
      'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Australia/Sydney'
    ]
    return { response: timezones }
  }

  // ===============================================
  // INSIGHTS & ANALYTICS
  // ===============================================

  async getMatchInsights(fixtureId) {
    try {
      const cacheKey = this.getCacheKey('match_insights', { fixtureId })
      const cached = this.getFromCache(cacheKey, true) // Use longer cache for insights
      if (cached) return { response: cached }

      // Get match data
      const fixture = await this.getFixtures({ id: fixtureId })
      if (!fixture.response?.[0]) throw new Error('Match not found')
      
      const match = fixture.response[0]
      const homeTeamId = match.teams.home.id
      const awayTeamId = match.teams.away.id
      const leagueId = match.league.id
      const season = match.league.season || new Date().getFullYear()

      // Parallel fetch of insights data
      const [teamStats, h2hData, formData, predictions] = await Promise.all([
        this.getTeamStatistics(homeTeamId, leagueId, season).catch(() => null),
        this.getHeadToHead(`${homeTeamId}-${awayTeamId}`).catch(() => null),
        this.getTeamForm(homeTeamId, 5).catch(() => null),
        this.getPredictions(fixtureId).catch(() => null)
      ])

      const insights = {
        match,
        teamStats,
        h2hData: h2hData?.response || [],
        homeForm: formData?.response || [],
        predictions: predictions?.response?.[0] || null,
        keyPlayers: await this.getKeyPlayers(homeTeamId, awayTeamId, leagueId, season),
        venueStats: await this.getVenueInsights(match.fixture?.venue?.id, homeTeamId),
        trendingStats: await this.getTrendingStats(leagueId, season)
      }

      this.setCache(cacheKey, insights)
      return { response: insights }
    } catch (error) {
      await this.handleError('fetch match insights', error)
    }
  }

  async getKeyPlayers(homeTeamId, awayTeamId, leagueId, season) {
    try {
      const [homePlayerStats, awayPlayerStats] = await Promise.all([
        this.client
          .from('player_statistics')
          .select(`
            *,
            player:players(id, name, position, photo_url)
          `)
          .eq('team_id', homeTeamId)
          .eq('league_id', leagueId)
          .eq('season', season)
          .order('goals', { ascending: false })
          .limit(3),
        this.client
          .from('player_statistics')
          .select(`
            *,
            player:players(id, name, position, photo_url)
          `)
          .eq('team_id', awayTeamId)
          .eq('league_id', leagueId)
          .eq('season', season)
          .order('goals', { ascending: false })
          .limit(3)
      ])

      return {
        home: homePlayerStats.data || [],
        away: awayPlayerStats.data || []
      }
    } catch (error) {
      console.error('Error fetching key players:', error)
      return { home: [], away: [] }
    }
  }

  async getVenueInsights(venueId, homeTeamId) {
    try {
      if (!venueId) return null

      const [venueData, homeRecord] = await Promise.all([
        this.getVenues({ id: venueId }),
        this.client
          .from('fixtures')
          .select('home_goals, away_goals, status_short')
          .eq('venue_id', venueId)
          .eq('home_team_id', homeTeamId)
          .eq('status_short', 'FT')
          .limit(10)
      ])

      const venue = venueData?.response?.[0]
      const matches = homeRecord.data || []
      
      if (!venue || matches.length === 0) return null

      const stats = {
        venue,
        homeWinRate: matches.filter(m => m.home_goals > m.away_goals).length / matches.length,
        avgGoalsFor: matches.reduce((sum, m) => sum + (m.home_goals || 0), 0) / matches.length,
        avgGoalsAgainst: matches.reduce((sum, m) => sum + (m.away_goals || 0), 0) / matches.length,
        cleanSheets: matches.filter(m => m.away_goals === 0).length,
        totalMatches: matches.length
      }

      return stats
    } catch (error) {
      console.error('Error fetching venue insights:', error)
      return null
    }
  }

  async getTrendingStats(leagueId, season) {
    try {
      const [topScorers, recentForm, leagueAvgs] = await Promise.all([
        this.getTopScorers(leagueId, season),
        this.client
          .from('fixtures')
          .select(`
            home_goals, away_goals, date,
            home_team:teams!fixtures_home_team_id_fkey(name),
            away_team:teams!fixtures_away_team_id_fkey(name)
          `)
          .eq('league_id', leagueId)
          .eq('season', season)
          .eq('status_short', 'FT')
          .order('date', { ascending: false })
          .limit(50),
        this.client
          .from('fixtures')
          .select('home_goals, away_goals')
          .eq('league_id', leagueId)
          .eq('season', season)
          .eq('status_short', 'FT')
      ])

      const recentMatches = recentForm.data || []
      const allMatches = leagueAvgs.data || []
      
      const trends = {
        topScorer: topScorers?.response?.[0] || null,
        avgGoalsPerGame: allMatches.length > 0 
          ? (allMatches.reduce((sum, m) => sum + (m.home_goals || 0) + (m.away_goals || 0), 0) / allMatches.length).toFixed(1)
          : 0,
        homeWinRate: allMatches.length > 0
          ? (allMatches.filter(m => (m.home_goals || 0) > (m.away_goals || 0)).length / allMatches.length * 100).toFixed(1)
          : 0,
        highScoringTrend: recentMatches.filter(m => 
          ((m.home_goals || 0) + (m.away_goals || 0)) > 2.5
        ).length / Math.max(recentMatches.length, 1) > 0.6
      }

      return trends
    } catch (error) {
      console.error('Error fetching trending stats:', error)
      return null
    }
  }

  async getTeamFormData(teamId, leagueId, season, limit = 10) {
    try {
      const cacheKey = this.getCacheKey('team_form', { teamId, leagueId, season, limit })
      const cached = this.getFromCache(cacheKey)
      if (cached) return { response: cached }

      const { data, error } = await this.client
        .from('fixtures')
        .select(`
          id, date, home_goals, away_goals, home_team_id, away_team_id,
          home_team:teams!fixtures_home_team_id_fkey(name, logo_url),
          away_team:teams!fixtures_away_team_id_fkey(name, logo_url)
        `)
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .eq('league_id', leagueId)
        .eq('season', season)
        .eq('status_short', 'FT')
        .order('date', { ascending: false })
        .limit(limit)

      if (error) throw error

      const formData = data.map(match => {
        const isHome = match.home_team_id === teamId
        const goalsFor = isHome ? match.home_goals : match.away_goals
        const goalsAgainst = isHome ? match.away_goals : match.home_goals
        
        let result = 'L'
        if (goalsFor > goalsAgainst) result = 'W'
        else if (goalsFor === goalsAgainst) result = 'D'
        
        return {
          ...match,
          result,
          goalsFor: goalsFor || 0,
          goalsAgainst: goalsAgainst || 0,
          isHome
        }
      })

      this.setCache(cacheKey, formData)
      return { response: formData }
    } catch (error) {
      await this.handleError('fetch team form data', error)
    }
  }

  async getH2HAnalysis(homeTeamId, awayTeamId, limit = 10) {
    try {
      const cacheKey = this.getCacheKey('h2h_analysis', { homeTeamId, awayTeamId, limit })
      const cached = this.getFromCache(cacheKey)
      if (cached) return { response: cached }

      const { data, error } = await this.client
        .from('fixtures')
        .select(`
          id, date, home_goals, away_goals, home_team_id, away_team_id,
          home_team:teams!fixtures_home_team_id_fkey(name, logo_url),
          away_team:teams!fixtures_away_team_id_fkey(name, logo_url),
          league:leagues(name)
        `)
        .or(`and(home_team_id.eq.${homeTeamId},away_team_id.eq.${awayTeamId}),and(home_team_id.eq.${awayTeamId},away_team_id.eq.${homeTeamId})`)
        .eq('status_short', 'FT')
        .order('date', { ascending: false })
        .limit(limit)

      if (error) throw error

      const analysis = {
        meetings: data || [],
        totalMeetings: data?.length || 0,
        homeTeamWins: data?.filter(m => 
          (m.home_team_id === homeTeamId && (m.home_goals || 0) > (m.away_goals || 0)) ||
          (m.away_team_id === homeTeamId && (m.away_goals || 0) > (m.home_goals || 0))
        ).length || 0,
        awayTeamWins: data?.filter(m => 
          (m.home_team_id === awayTeamId && (m.home_goals || 0) > (m.away_goals || 0)) ||
          (m.away_team_id === awayTeamId && (m.away_goals || 0) > (m.home_goals || 0))
        ).length || 0,
        draws: data?.filter(m => (m.home_goals || 0) === (m.away_goals || 0)).length || 0,
        avgGoalsPerMatch: data?.length ? 
          (data.reduce((sum, m) => sum + (m.home_goals || 0) + (m.away_goals || 0), 0) / data.length).toFixed(1) : 0
      }

      this.setCache(cacheKey, analysis)
      return { response: analysis }
    } catch (error) {
      await this.handleError('fetch H2H analysis', error)
    }
  }

  // Betting-focused helper methods
  async getFixtureOdds(fixture) {
    return this.getOdds({ fixture })
  }

  async getTeamForm(team, last = 10) {
    return this.getFixtures({ team, last })
  }

  async getBettingStatistics(team, league, season) {
    return this.getTeamStatistics(team, league, season)
  }
}

// Create singleton instance
export const supabaseService = new SupabaseService()

// Export for backwards compatibility
export default supabaseService