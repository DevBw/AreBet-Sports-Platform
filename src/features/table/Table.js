// ===============================================
// TABLE PAGE COMPONENT
// League standings and table view
// ===============================================

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../shared/hooks/useAuth'
import { areBetService } from '../../shared/services/SupabaseServiceV2'
import { 
  Header,
  Card, 
  LoadingSpinner,
  BackgroundWrapper,
  PremiumGate
} from '../../shared/components'

const Table = () => {
  const { isPremium } = useAuth()
  const [standings, setStandings] = useState([])
  const [leagues, setLeagues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedLeague, setSelectedLeague] = useState('')
  const [selectedSeason, setSelectedSeason] = useState('2024')

  const loadLeagues = useCallback(async () => {
    try {
      const leaguesResponse = await areBetService.getLeagues({ limit: 20 })
      if (leaguesResponse?.response) {
        setLeagues(leaguesResponse.response)
        // Auto-select first league
        if (leaguesResponse.response.length > 0 && !selectedLeague) {
          setSelectedLeague(leaguesResponse.response[0].league.id.toString())
        }
      }
    } catch (err) {
      console.error('Error loading leagues:', err)
    }
  }, [selectedLeague])

  const loadStandings = useCallback(async () => {
    if (!selectedLeague) return

    try {
      setLoading(true)
      setError(null)

      const standingsResponse = await areBetService.getStandings({
        league: parseInt(selectedLeague),
        season: parseInt(selectedSeason)
      })

      if (standingsResponse?.response?.[0]?.league?.standings?.[0]) {
        setStandings(standingsResponse.response[0].league.standings[0])
      } else {
        setStandings([])
      }
    } catch (err) {
      console.error('Error loading standings:', err)
      setError('Failed to load standings')
      setStandings([])
    } finally {
      setLoading(false)
    }
  }, [selectedLeague, selectedSeason])

  useEffect(() => {
    loadLeagues()
  }, [loadLeagues])

  useEffect(() => {
    if (selectedLeague) {
      loadStandings()
    }
  }, [loadStandings, selectedLeague])

  const handleLeagueChange = (e) => {
    setSelectedLeague(e.target.value)
  }

  const handleSeasonChange = (e) => {
    setSelectedSeason(e.target.value)
  }

  const getPositionStyle = (position) => {
    if (position <= 4) return 'text-green-400' // Champions League
    if (position <= 6) return 'text-blue-400' // Europa League
    if (position >= 18) return 'text-red-400' // Relegation
    return 'text-visible'
  }

  const getFormStyle = (form) => {
    if (!form) return ''
    const wins = (form.match(/W/g) || []).length
    const losses = (form.match(/L/g) || []).length
    if (wins > losses) return 'text-green-400'
    if (losses > wins) return 'text-red-400'
    return 'text-yellow-400'
  }

  return (
    <BackgroundWrapper>
      <Header />
      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-visible-strong mb-2">League Tables</h1>
            <p className="text-visible">View current league standings and team statistics</p>
          </div>

          {/* Filters */}
          <Card className="mb-6 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* League Filter */}
              <select
                value={selectedLeague}
                onChange={handleLeagueChange}
                className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none text-visible"
              >
                <option value="">Select League</option>
                {leagues.map(league => (
                  <option key={league.league.id} value={league.league.id.toString()}>
                    {league.league.name} ({league.country.name})
                  </option>
                ))}
              </select>

              {/* Season Filter */}
              <select
                value={selectedSeason}
                onChange={handleSeasonChange}
                className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none text-visible"
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>

              {/* Team Count */}
              <div className="flex items-center text-sm text-visible">
                {loading ? "Loading..." : `${standings.length} teams`}
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
                onClick={loadStandings}
                className="mt-4 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors"
              >
                Try Again
              </button>
            </Card>
          ) : standings.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-visible">No standings available for the selected league and season</div>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              {/* Table Header */}
              <div className="bg-gray-800 p-4 border-b border-gray-700">
                <h2 className="text-lg font-bold text-visible-strong">
                  {leagues.find(l => l.league.id.toString() === selectedLeague)?.league?.name} - {selectedSeason}
                </h2>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900">
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-visible">#</th>
                      <th className="text-left py-3 px-4 font-semibold text-visible">Team</th>
                      <th className="text-center py-3 px-2 font-semibold text-visible">MP</th>
                      <th className="text-center py-3 px-2 font-semibold text-visible">W</th>
                      <th className="text-center py-3 px-2 font-semibold text-visible">D</th>
                      <th className="text-center py-3 px-2 font-semibold text-visible">L</th>
                      <th className="text-center py-3 px-2 font-semibold text-visible">GF</th>
                      <th className="text-center py-3 px-2 font-semibold text-visible">GA</th>
                      <th className="text-center py-3 px-2 font-semibold text-visible">GD</th>
                      <th className="text-center py-3 px-2 font-semibold text-visible">Pts</th>
                      {isPremium && (
                        <th className="text-center py-3 px-2 font-semibold text-visible">Form</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((team, index) => (
                      <tr 
                        key={team.team.id}
                        className={`border-b border-gray-700 hover:bg-gray-800 transition-colors ${
                          index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-850'
                        }`}
                      >
                        <td className={`py-3 px-4 font-bold ${getPositionStyle(team.rank)}`}>
                          {team.rank}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <img
                              src={team.team.logo}
                              alt={team.team.name}
                              className="w-6 h-6 object-cover rounded"
                              onError={(e) => {
                                e.target.src = '/api/placeholder/24/24'
                              }}
                            />
                            <span className="text-visible font-medium">{team.team.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center text-visible">{team.all.played}</td>
                        <td className="py-3 px-2 text-center text-green-400">{team.all.win}</td>
                        <td className="py-3 px-2 text-center text-yellow-400">{team.all.draw}</td>
                        <td className="py-3 px-2 text-center text-red-400">{team.all.lose}</td>
                        <td className="py-3 px-2 text-center text-visible">{team.all.goals.for}</td>
                        <td className="py-3 px-2 text-center text-visible">{team.all.goals.against}</td>
                        <td className={`py-3 px-2 text-center font-medium ${
                          team.goalsDiff > 0 ? 'text-green-400' : 
                          team.goalsDiff < 0 ? 'text-red-400' : 'text-visible'
                        }`}>
                          {team.goalsDiff > 0 ? '+' : ''}{team.goalsDiff}
                        </td>
                        <td className="py-3 px-2 text-center font-bold text-yellow-400">{team.points}</td>
                        {isPremium && (
                          <td className="py-3 px-2 text-center">
                            <PremiumGate feature="advanced_stats" inline>
                              <span className={`font-mono text-xs ${getFormStyle(team.form)}`}>
                                {team.form || 'N/A'}
                              </span>
                            </PremiumGate>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="bg-gray-800 p-4 border-t border-gray-700">
                <div className="flex flex-wrap items-center space-x-4 text-xs text-visible">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span>Champions League</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span>Europa League</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <span>Relegation</span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
    </BackgroundWrapper>
  )
}

export default Table