// ===============================================
// STATS PAGE COMPONENT
// Team and player statistics dashboard
// ===============================================

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../../shared/hooks/useAuth'
import { areBetService } from '../../shared/services/SupabaseServiceV2'
import { 
  Header,
  Card, 
  LoadingSpinner,
  BackgroundWrapper,
  PremiumGate
} from '../../shared/components'

const Stats = () => {
  const { isPremium } = useAuth()
  const [teams, setTeams] = useState([])
  const [leagues, setLeagues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedLeague, setSelectedLeague] = useState('')
  const [selectedSeason, setSelectedSeason] = useState('2024')
  const [activeTab, setActiveTab] = useState('team')
  const [sortBy, setSortBy] = useState('points')
  const [sortDirection, setSortDirection] = useState('desc')

  const loadLeagues = useCallback(async () => {
    try {
      const leaguesResponse = await areBetService.getLeagues({ limit: 20 })
      if (leaguesResponse?.response) {
        setLeagues(leaguesResponse.response)
        if (leaguesResponse.response.length > 0 && !selectedLeague) {
          setSelectedLeague(leaguesResponse.response[0].league.id.toString())
        }
      }
    } catch (err) {
      console.error('Error loading leagues:', err)
    }
  }, [selectedLeague])

  const loadTeamStats = useCallback(async () => {
    if (!selectedLeague) return

    try {
      setLoading(true)
      setError(null)

      // Get standings which include team stats
      const standingsResponse = await areBetService.getStandings({
        league: parseInt(selectedLeague),
        season: parseInt(selectedSeason)
      })

      if (standingsResponse?.response?.[0]?.league?.standings?.[0]) {
        setTeams(standingsResponse.response[0].league.standings[0])
      } else {
        setTeams([])
      }
    } catch (err) {
      console.error('Error loading team stats:', err)
      setError('Failed to load statistics')
      setTeams([])
    } finally {
      setLoading(false)
    }
  }, [selectedLeague, selectedSeason])

  useEffect(() => {
    loadLeagues()
  }, [loadLeagues])

  useEffect(() => {
    if (selectedLeague && activeTab === 'team') {
      loadTeamStats()
    }
  }, [loadTeamStats, activeTab, selectedLeague])

  // Sort teams based on selected criteria
  const sortedTeams = useMemo(() => {
    if (!teams.length) return []

    return [...teams].sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'points':
          aValue = a.points
          bValue = b.points
          break
        case 'goals_for':
          aValue = a.all.goals.for
          bValue = b.all.goals.for
          break
        case 'goals_against':
          aValue = a.all.goals.against
          bValue = b.all.goals.against
          break
        case 'goal_difference':
          aValue = a.goalsDiff
          bValue = b.goalsDiff
          break
        case 'wins':
          aValue = a.all.win
          bValue = b.all.win
          break
        case 'draws':
          aValue = a.all.draw
          bValue = b.all.draw
          break
        case 'losses':
          aValue = a.all.lose
          bValue = b.all.lose
          break
        case 'played':
          aValue = a.all.played
          bValue = b.all.played
          break
        default:
          aValue = a.points
          bValue = b.points
      }

      return sortDirection === 'desc' ? bValue - aValue : aValue - bValue
    })
  }, [teams, sortBy, sortDirection])

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(field)
      setSortDirection('desc')
    }
  }

  const getTopStats = () => {
    if (!teams.length) return {}

    const topScorer = teams.reduce((max, team) => 
      team.all.goals.for > max.all.goals.for ? team : max
    )
    
    const bestDefense = teams.reduce((min, team) => 
      team.all.goals.against < min.all.goals.against ? team : min
    )

    const mostWins = teams.reduce((max, team) => 
      team.all.win > max.all.win ? team : max
    )

    return { topScorer, bestDefense, mostWins }
  }

  const topStats = getTopStats()

  return (
    <BackgroundWrapper>
      <Header />
      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-visible-strong mb-2">Statistics</h1>
            <p className="text-visible">Detailed team and player statistics</p>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('team')}
                className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                  activeTab === 'team'
                    ? 'bg-yellow-500 text-black'
                    : 'text-visible hover:text-yellow-400'
                }`}
              >
                Team Stats
              </button>
              <button
                onClick={() => setActiveTab('player')}
                className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                  activeTab === 'player'
                    ? 'bg-yellow-500 text-black'
                    : 'text-visible hover:text-yellow-400'
                } ${!isPremium ? 'opacity-50' : ''}`}
                disabled={!isPremium}
              >
                Player Stats {!isPremium && '🔒'}
              </button>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none text-visible"
              >
                <option value="">Select League</option>
                {leagues.map(league => (
                  <option key={league.league.id} value={league.league.id.toString()}>
                    {league.league.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none text-visible"
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>

              {activeTab === 'team' && (
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none text-visible"
                >
                  <option value="points">Sort by Points</option>
                  <option value="goals_for">Sort by Goals For</option>
                  <option value="goals_against">Sort by Goals Against</option>
                  <option value="goal_difference">Sort by Goal Difference</option>
                  <option value="wins">Sort by Wins</option>
                  <option value="draws">Sort by Draws</option>
                  <option value="losses">Sort by Losses</option>
                </select>
              )}
            </div>
          </Card>

          {/* Team Stats Tab */}
          {activeTab === 'team' && (
            <>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <LoadingSpinner />
                </div>
              ) : error ? (
                <Card className="p-8 text-center">
                  <div className="text-red-500 text-visible">{error}</div>
                  <button
                    onClick={loadTeamStats}
                    className="mt-4 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors"
                  >
                    Try Again
                  </button>
                </Card>
              ) : teams.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="text-visible">No statistics available</div>
                </Card>
              ) : (
                <>
                  {/* Top Stats Cards */}
                  {topStats.topScorer && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card className="p-4 text-center">
                        <div className="text-sm text-visible mb-1">Top Scorer</div>
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <img
                            src={topStats.topScorer.team.logo}
                            alt={topStats.topScorer.team.name}
                            className="w-6 h-6"
                          />
                          <span className="font-medium text-visible">{topStats.topScorer.team.name}</span>
                        </div>
                        <div className="text-xl font-bold text-yellow-400">{topStats.topScorer.all.goals.for} goals</div>
                      </Card>

                      <Card className="p-4 text-center">
                        <div className="text-sm text-visible mb-1">Best Defense</div>
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <img
                            src={topStats.bestDefense.team.logo}
                            alt={topStats.bestDefense.team.name}
                            className="w-6 h-6"
                          />
                          <span className="font-medium text-visible">{topStats.bestDefense.team.name}</span>
                        </div>
                        <div className="text-xl font-bold text-green-400">{topStats.bestDefense.all.goals.against} goals</div>
                      </Card>

                      <Card className="p-4 text-center">
                        <div className="text-sm text-visible mb-1">Most Wins</div>
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <img
                            src={topStats.mostWins.team.logo}
                            alt={topStats.mostWins.team.name}
                            className="w-6 h-6"
                          />
                          <span className="font-medium text-visible">{topStats.mostWins.team.name}</span>
                        </div>
                        <div className="text-xl font-bold text-blue-400">{topStats.mostWins.all.win} wins</div>
                      </Card>
                    </div>
                  )}

                  {/* Detailed Stats Table */}
                  <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-900">
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-3 px-4 font-semibold text-visible">Team</th>
                            <th 
                              className="text-center py-3 px-2 font-semibold text-visible cursor-pointer hover:text-yellow-400"
                              onClick={() => handleSort('played')}
                            >
                              MP {sortBy === 'played' && (sortDirection === 'desc' ? '↓' : '↑')}
                            </th>
                            <th 
                              className="text-center py-3 px-2 font-semibold text-visible cursor-pointer hover:text-yellow-400"
                              onClick={() => handleSort('wins')}
                            >
                              W {sortBy === 'wins' && (sortDirection === 'desc' ? '↓' : '↑')}
                            </th>
                            <th 
                              className="text-center py-3 px-2 font-semibold text-visible cursor-pointer hover:text-yellow-400"
                              onClick={() => handleSort('draws')}
                            >
                              D {sortBy === 'draws' && (sortDirection === 'desc' ? '↓' : '↑')}
                            </th>
                            <th 
                              className="text-center py-3 px-2 font-semibold text-visible cursor-pointer hover:text-yellow-400"
                              onClick={() => handleSort('losses')}
                            >
                              L {sortBy === 'losses' && (sortDirection === 'desc' ? '↓' : '↑')}
                            </th>
                            <th 
                              className="text-center py-3 px-2 font-semibold text-visible cursor-pointer hover:text-yellow-400"
                              onClick={() => handleSort('goals_for')}
                            >
                              GF {sortBy === 'goals_for' && (sortDirection === 'desc' ? '↓' : '↑')}
                            </th>
                            <th 
                              className="text-center py-3 px-2 font-semibold text-visible cursor-pointer hover:text-yellow-400"
                              onClick={() => handleSort('goals_against')}
                            >
                              GA {sortBy === 'goals_against' && (sortDirection === 'desc' ? '↓' : '↑')}
                            </th>
                            <th 
                              className="text-center py-3 px-2 font-semibold text-visible cursor-pointer hover:text-yellow-400"
                              onClick={() => handleSort('goal_difference')}
                            >
                              GD {sortBy === 'goal_difference' && (sortDirection === 'desc' ? '↓' : '↑')}
                            </th>
                            <th 
                              className="text-center py-3 px-2 font-semibold text-visible cursor-pointer hover:text-yellow-400"
                              onClick={() => handleSort('points')}
                            >
                              Pts {sortBy === 'points' && (sortDirection === 'desc' ? '↓' : '↑')}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedTeams.map((team, index) => (
                            <tr 
                              key={team.team.id}
                              className={`border-b border-gray-700 hover:bg-gray-800 transition-colors ${
                                index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-850'
                              }`}
                            >
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
                              <td className="py-3 px-2 text-center text-visible font-semibold">{team.all.goals.for}</td>
                              <td className="py-3 px-2 text-center text-visible font-semibold">{team.all.goals.against}</td>
                              <td className={`py-3 px-2 text-center font-semibold ${
                                team.goalsDiff > 0 ? 'text-green-400' : 
                                team.goalsDiff < 0 ? 'text-red-400' : 'text-visible'
                              }`}>
                                {team.goalsDiff > 0 ? '+' : ''}{team.goalsDiff}
                              </td>
                              <td className="py-3 px-2 text-center font-bold text-yellow-400">{team.points}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </>
              )}
            </>
          )}

          {/* Player Stats Tab */}
          {activeTab === 'player' && (
            <PremiumGate feature="player_stats" title="Player Statistics" description="Access detailed player statistics and performance metrics">
              <Card className="p-8 text-center">
                <div className="text-visible">Player statistics feature coming soon...</div>
                <div className="text-sm text-muted mt-2">Track top scorers, assists, and player performance metrics</div>
              </Card>
            </PremiumGate>
          )}
        </div>
      </main>
    </BackgroundWrapper>
  )
}

export default Stats