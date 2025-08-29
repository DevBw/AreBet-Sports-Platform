// ===============================================
// UNIFIED MATCH CARD COMPONENT
// Consolidated match card with multiple variants and subscription features
// ===============================================

import React, { memo, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useAuth } from '../hooks/useAuth'
import { useUserPreferences } from '../hooks/useUserPreferences'
import { PremiumGate, PremiumBadge } from './PremiumGate'
import LazyImage from './LazyImage'
import Card from './Card'

const StarIcon = ({ size = 16, filled = false }) => (
  <svg width={size} height={size} fill={filled ? "#FFD700" : "none"} stroke={filled ? "#FFD700" : "currentColor"} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
  </svg>
)

const getStatusDisplay = (status) => {
  const statusMap = {
    'NS': { text: 'Not Started', color: 'text-blue-400', bg: 'bg-blue-500/20' },
    '1H': { text: 'First Half', color: 'text-red-400', bg: 'bg-red-500/20' },
    'HT': { text: 'Half Time', color: 'text-orange-400', bg: 'bg-orange-500/20' },
    '2H': { text: 'Second Half', color: 'text-red-400', bg: 'bg-red-500/20' },
    'ET': { text: 'Extra Time', color: 'text-purple-400', bg: 'bg-purple-500/20' },
    'FT': { text: 'Full Time', color: 'text-green-400', bg: 'bg-green-500/20' },
    'AET': { text: 'After Extra', color: 'text-purple-400', bg: 'bg-purple-500/20' },
    'PEN': { text: 'Penalties', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    'PST': { text: 'Postponed', color: 'text-gray-400', bg: 'bg-gray-500/20' },
    'CANC': { text: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/20' },
    'ABD': { text: 'Abandoned', color: 'text-red-400', bg: 'bg-red-500/20' },
    'LIVE': { text: 'Live', color: 'text-red-400', bg: 'bg-red-500/20' }
  }
  
  return statusMap[status] || { text: status, color: 'text-gray-400', bg: 'bg-gray-500/20' }
}

const formatMatchTime = (date, status, elapsed = null) => {
  const matchDate = new Date(date)
  const now = new Date()
  
  if (['FT', 'AET', 'PEN'].includes(status)) {
    return 'Finished'
  }
  
  if (['1H', '2H', 'HT', 'ET', 'LIVE'].includes(status)) {
    return elapsed ? `${elapsed}'` : 'Live Now'
  }
  
  if (status === 'NS') {
    if (matchDate.toDateString() === now.toDateString()) {
      return matchDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: false 
      })
    } else {
      return matchDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }
  
  return getStatusDisplay(status).text
}

const getTeamLogo = (team) => {
  if (team?.logo) return team.logo
  if (team?.team?.logo) return team.team.logo
  return null
}

const getTeamName = (team) => {
  if (team?.name) return team.name
  if (team?.team?.name) return team.team.name
  return 'Unknown Team'
}

const getScore = (match, isHome) => {
  const score = match?.score
  if (!score) return '-'
  
  if (score.fulltime) {
    return isHome ? score.fulltime.home : score.fulltime.away
  }
  if (score.current) {
    return isHome ? score.current.home : score.current.away
  }
  if (match.goals) {
    return isHome ? match.goals.home : match.goals.away
  }
  return '-'
}

const MatchCard = memo(({ 
  match, 
  onClick, 
  variant = 'modern',
  showPredictions = false, 
  showFavorites = false,
  className = '' 
}) => {
  const { isPremium, hasFeature } = useAuth()
  const { addFavorite, removeFavorite, isFavorite } = useUserPreferences()
  const [isImageError, setIsImageError] = useState(false)
  
  const handleFavoriteToggle = useCallback((e, matchId) => {
    e.stopPropagation()
    if (isFavorite(matchId)) {
      removeFavorite(matchId)
    } else {
      addFavorite(matchId)
    }
  }, [addFavorite, removeFavorite, isFavorite])

  const handleClick = useCallback(() => {
    if (onClick) onClick(match)
  }, [onClick, match])

  if (!match) return null

  const status = match.fixture?.status?.short || match.status || 'NS'
  const statusDisplay = getStatusDisplay(status)
  const matchTime = formatMatchTime(
    match.fixture?.date || match.date, 
    status, 
    match.fixture?.status?.elapsed
  )
  
  const homeTeam = match.teams?.home || match.home
  const awayTeam = match.teams?.away || match.away
  const league = match.league
  
  const homeScore = getScore(match, true)
  const awayScore = getScore(match, false)
  
  const isLive = ['1H', '2H', 'HT', 'ET', 'LIVE'].includes(status)
  const isFinished = ['FT', 'AET', 'PEN'].includes(status)

  // Variant-specific styling
  const cardVariants = {
    modern: "bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 border-gray-700/50",
    enhanced: "bg-black/40 backdrop-blur-sm border-gray-800/50",
    prediction: "bg-gray-900/90 border-gray-700/60"
  }

  const cardClass = `
    ${cardVariants[variant] || cardVariants.modern}
    border rounded-xl p-4 transition-all duration-300 
    hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 
    cursor-pointer group relative overflow-hidden
    ${className}
  `

  return (
    <div onClick={handleClick} className={cardClass}>
      {/* Live indicator */}
      {isLive && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-red-400 font-medium">LIVE</span>
          </div>
        </div>
      )}

      {/* League info */}
      {league && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {league.logo && (
              <LazyImage
                src={league.logo}
                alt={league.name}
                className="w-5 h-5 rounded"
                fallback={<div className="w-5 h-5 bg-gray-700 rounded"></div>}
              />
            )}
            <span className="text-sm text-gray-300 font-medium">
              {league.name || league.league?.name}
            </span>
          </div>
          
          {showFavorites && (
            <button
              onClick={(e) => handleFavoriteToggle(e, match.fixture?.id || match.id)}
              className="p-1 rounded-full hover:bg-gray-700/50 transition-colors"
            >
              <StarIcon 
                size={16} 
                filled={isFavorite(match.fixture?.id || match.id)} 
              />
            </button>
          )}
        </div>
      )}

      {/* Teams and scores */}
      <div className="space-y-3">
        {/* Home team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-8 h-8 flex-shrink-0">
              {getTeamLogo(homeTeam) && !isImageError ? (
                <LazyImage
                  src={getTeamLogo(homeTeam)}
                  alt={getTeamName(homeTeam)}
                  className="w-full h-full object-contain"
                  onError={() => setIsImageError(true)}
                  fallback={
                    <div className="w-full h-full bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-300">
                        {getTeamName(homeTeam).charAt(0)}
                      </span>
                    </div>
                  }
                />
              ) : (
                <div className="w-full h-full bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-300">
                    {getTeamName(homeTeam).charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <span className="font-medium text-white truncate">
              {getTeamName(homeTeam)}
            </span>
          </div>
          <span className="text-xl font-bold text-white ml-3">
            {homeScore}
          </span>
        </div>

        {/* Away team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-8 h-8 flex-shrink-0">
              {getTeamLogo(awayTeam) && !isImageError ? (
                <LazyImage
                  src={getTeamLogo(awayTeam)}
                  alt={getTeamName(awayTeam)}
                  className="w-full h-full object-contain"
                  onError={() => setIsImageError(true)}
                  fallback={
                    <div className="w-full h-full bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-300">
                        {getTeamName(awayTeam).charAt(0)}
                      </span>
                    </div>
                  }
                />
              ) : (
                <div className="w-full h-full bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-300">
                    {getTeamName(awayTeam).charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <span className="font-medium text-white truncate">
              {getTeamName(awayTeam)}
            </span>
          </div>
          <span className="text-xl font-bold text-white ml-3">
            {awayScore}
          </span>
        </div>
      </div>

      {/* Status and time */}
      <div className="mt-4 flex items-center justify-between">
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.bg} ${statusDisplay.color}`}>
          {matchTime}
        </div>
        
        {showPredictions && match.predictions && hasFeature('predictions') && (
          <PremiumGate 
            featureName="AI Predictions"
            minimumTier="pro"
            fallback={<PremiumBadge size="sm" />}
          >
            <div className="text-xs text-yellow-400">
              {match.predictions.winner ? `${match.predictions.winner} to win` : 'Prediction available'}
            </div>
          </PremiumGate>
        )}
      </div>

      {/* Hover effect gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/5 group-hover:via-yellow-500/10 group-hover:to-yellow-500/5 transition-all duration-300 rounded-xl pointer-events-none"></div>
    </div>
  )
})

MatchCard.displayName = 'MatchCard'

MatchCard.propTypes = {
  match: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['modern', 'enhanced', 'prediction']),
  showPredictions: PropTypes.bool,
  showFavorites: PropTypes.bool,
  className: PropTypes.string
}

export default MatchCard