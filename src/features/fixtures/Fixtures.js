// ===============================================
// FIXTURES PAGE COMPONENT
// Comprehensive fixture listings with filters and search
// ===============================================

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../../shared/hooks/useAuth'
import { areBetService } from '../../shared/services/SupabaseServiceV2'
import { 
  Header,
  Card, 
  LoadingSpinner,
  BackgroundWrapper,
  MatchCard
} from '../../shared/components'

const Fixtures = () => {
  const { isPremium, hasFeature } = useAuth()
  const [fixtures, setFixtures] = useState([])
  const [leagues, setLeagues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedLeague, setSelectedLeague] = useState('all')
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [searchTerm, setSearchTerm] = useState('')

  const loadFixtures = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Load fixtures for selected date
      const fixturesResponse = await areBetService.getFixtures({ 
        date: selectedDate, 
        limit: 100 
      })

      if (fixturesResponse?.response) {
        setFixtures(fixturesResponse.response)
      } else {
        setFixtures([])
      }
    } catch (err) {
      console.error('Error loading fixtures:', err)
      setError('Failed to load fixtures')
      setFixtures([])
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  const loadLeagues = useCallback(async () => {
    try {
      const leaguesResponse = await areBetService.getLeagues({ limit: 50 })
      if (leaguesResponse?.response) {
        setLeagues(leaguesResponse.response)
      }
    } catch (err) {
      console.error('Error loading leagues:', err)
    }
  }, [])

  useEffect(() => {
    loadFixtures()
  }, [loadFixtures])

  useEffect(() => {
    loadLeagues()
  }, [loadLeagues])

  // Filter fixtures based on league and search
  const filteredFixtures = useMemo(() => {
    let filtered = fixtures

    // Filter by league
    if (selectedLeague !== 'all') {
      filtered = filtered.filter(fixture => 
        fixture.league?.id?.toString() === selectedLeague
      )
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(fixture => 
        fixture.teams?.home?.name?.toLowerCase().includes(search) ||
        fixture.teams?.away?.name?.toLowerCase().includes(search) ||
        fixture.league?.name?.toLowerCase().includes(search)
      )
    }

    return filtered
  }, [fixtures, selectedLeague, searchTerm])

  // Group fixtures by status
  const groupedFixtures = useMemo(() => {
    const groups = {
      live: [],
      upcoming: [],
      finished: []
    }

    filteredFixtures.forEach(fixture => {
      const status = fixture.fixture?.status?.short
      if (['1H', '2H', 'HT', 'LIVE'].includes(status)) {
        groups.live.push(fixture)
      } else if (status === 'NS') {
        groups.upcoming.push(fixture)
      } else {
        groups.finished.push(fixture)
      }
    })

    return groups
  }, [filteredFixtures])

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value)
  }

  const handleLeagueChange = (e) => {
    setSelectedLeague(e.target.value)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const navigateDate = (direction) => {
    const currentDate = new Date(selectedDate)
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + direction)
    setSelectedDate(newDate.toISOString().split('T')[0])
  }

  return (
    <BackgroundWrapper>
      <Header />
      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-yellow-400 text-visible-strong mb-2">Fixtures</h1>
            <p className="text-base text-gray-300 text-visible">Browse football fixtures by date and league</p>
          </div>

          {/* Filters */}
          <Card className="mb-6 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Navigation */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateDate(-1)}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-visible"
                >
                  ←
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none text-visible"
                />
                <button
                  onClick={() => navigateDate(1)}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-visible"
                >
                  →
                </button>
              </div>

              {/* League Filter */}
              <select
                value={selectedLeague}
                onChange={handleLeagueChange}
                className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none text-visible"
              >
                <option value="all">All Leagues</option>
                {leagues.map(league => (
                  <option key={league.league.id} value={league.league.id.toString()}>
                    {league.league.name}
                  </option>
                ))}
              </select>

              {/* Search */}
              <input
                type="text"
                placeholder="Search teams..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none text-visible"
              />

              {/* Results Count */}
              <div className="flex items-center text-sm text-visible">
                {loading ? (
                  "Loading..."
                ) : (
                  `${filteredFixtures.length} fixture${filteredFixtures.length !== 1 ? 's' : ''} found`
                )}
              </div>
            </div>
          </Card>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <Card className="p-8 text-center">
              <div className="text-red-500 text-visible">{error}</div>
              <button
                onClick={loadFixtures}
                className="mt-4 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors"
              >
                Try Again
              </button>
            </Card>
          ) : filteredFixtures.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-visible">No fixtures found for the selected criteria</div>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Live Matches */}
              {groupedFixtures.live.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-visible-strong mb-3">Live Matches</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {groupedFixtures.live.map(fixture => (
                      <MatchCard
                        key={fixture.fixture.id}
                        match={fixture}
                        showPredictions={isPremium}
                        size="standard"
                        className="w-full"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Matches */}
              {groupedFixtures.upcoming.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-visible-strong mb-4">Upcoming Matches</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {groupedFixtures.upcoming.map(fixture => (
                      <MatchCard
                        key={fixture.fixture.id}
                        match={fixture}
                        showPredictions={isPremium && hasFeature('predictions')}
                        size="standard"
                        className="w-full"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Finished Matches */}
              {groupedFixtures.finished.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-visible-strong mb-4">Finished Matches</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {groupedFixtures.finished.map(fixture => (
                      <MatchCard
                        key={fixture.fixture.id}
                        match={fixture}
                        showAdvancedStats={hasFeature('advanced_stats')}
                        size="standard"
                        className="w-full"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </BackgroundWrapper>
  )
}

export default Fixtures