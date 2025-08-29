// ===============================================
// UNIFIED SIDEBAR COMPONENT
// Configurable sidebar for left/right positioning with filters and content
// ===============================================

import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import Icon from './Icon'
import Button from './Button'
import { useAuth } from '../hooks/useAuth'
import { useUserPreferences } from '../hooks/useUserPreferences'

const UnifiedSidebar = ({ 
  position = 'left', 
  isOpen, 
  onClose, 
  variant = 'filter',
  className = '' 
}) => {
  const { isPremium, user } = useAuth()
  const { preferences, updatePreferences } = useUserPreferences()
  
  const [accordions, setAccordions] = useState({
    leagues: true,
    teams: false,
    dates: false,
    status: false,
    insights: false,
    settings: false
  })
  
  const [leagues] = useState([
    { id: 39, name: 'Premier League', flag: '🇬🇧', country: 'England' },
    { id: 140, name: 'La Liga', flag: '🇪🇸', country: 'Spain' },
    { id: 135, name: 'Serie A', flag: '🇮🇹', country: 'Italy' },
    { id: 78, name: 'Bundesliga', flag: '🇩🇪', country: 'Germany' },
    { id: 61, name: 'Ligue 1', flag: '🇫🇷', country: 'France' },
    { id: 2, name: 'Champions League', flag: '🏆', country: 'Europe' }
  ])

  const toggleAccordion = useCallback((section) => {
    setAccordions(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }, [])

  // Position-specific styling
  const positionClass = position === 'left' 
    ? 'left-0 border-r border-gray-800' 
    : 'right-0 border-l border-gray-800'
  
  const transformClass = position === 'left'
    ? isOpen ? 'translate-x-0' : '-translate-x-full'
    : isOpen ? 'translate-x-0' : 'translate-x-full'

  const sidebarClass = `
    fixed top-0 ${positionClass} h-full w-80 
    bg-gray-900/95 backdrop-blur-sm z-40 
    transform ${transformClass} transition-transform duration-300 ease-in-out
    overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent
    ${className}
  `

  // Render content based on variant
  const renderContent = () => {
    switch (variant) {
      case 'filter':
        return renderFilterContent()
      case 'insights':
        return renderInsightsContent()
      case 'settings':
        return renderSettingsContent()
      default:
        return renderFilterContent()
    }
  }

  const renderFilterContent = () => (
    <>
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Filters</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-md transition-colors"
          >
            <Icon name="close" className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Filter Sections */}
      <div className="p-6 space-y-6">
        
        {/* League Filter */}
        <div className="space-y-3">
          <button
            onClick={() => toggleAccordion('leagues')}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="font-medium text-white">Leagues</span>
            <Icon 
              name={accordions.leagues ? "chevron-up" : "chevron-down"}
              className="w-4 h-4 text-gray-400" 
            />
          </button>
          
          {accordions.leagues && (
            <div className="space-y-2 pl-4">
              {leagues.map((league) => (
                <label key={league.id} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-300 flex items-center space-x-2">
                    <span>{league.flag}</span>
                    <span>{league.name}</span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="space-y-3">
          <button
            onClick={() => toggleAccordion('status')}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="font-medium text-white">Match Status</span>
            <Icon 
              name={accordions.status ? "chevron-up" : "chevron-down"}
              className="w-4 h-4 text-gray-400" 
            />
          </button>
          
          {accordions.status && (
            <div className="space-y-2 pl-4">
              {[
                { value: 'live', label: 'Live', color: 'text-red-400' },
                { value: 'upcoming', label: 'Upcoming', color: 'text-blue-400' },
                { value: 'finished', label: 'Finished', color: 'text-green-400' }
              ].map((status) => (
                <label key={status.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className={`text-sm ${status.color}`}>
                    {status.label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )

  const renderInsightsContent = () => (
    <>
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Insights</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-md transition-colors"
          >
            <Icon name="close" className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Insights Content */}
      <div className="p-6 space-y-6">
        {isPremium ? (
          <>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-medium text-white mb-2">Today's Value Bets</h3>
              <p className="text-sm text-gray-400">3 high-probability opportunities identified</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-medium text-white mb-2">Live Predictions</h3>
              <p className="text-sm text-gray-400">Real-time AI analysis for 12 active matches</p>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Icon name="lock" className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-400 mb-4">Unlock premium insights</p>
            <Button size="sm" variant="premium">
              Upgrade Now
            </Button>
          </div>
        )}
      </div>
    </>
  )

  const renderSettingsContent = () => (
    <>
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-md transition-colors"
          >
            <Icon name="close" className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Settings Content */}
      <div className="p-6 space-y-6">
        
        {/* Notifications */}
        <div className="space-y-3">
          <h3 className="font-medium text-white">Notifications</h3>
          <div className="space-y-3">
            {[
              { key: 'live_scores', label: 'Live Score Updates' },
              { key: 'predictions', label: 'AI Predictions' },
              { key: 'value_bets', label: 'Value Bet Alerts' }
            ].map((setting) => (
              <label key={setting.key} className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{setting.label}</span>
                <input
                  type="checkbox"
                  checked={preferences?.notifications?.[setting.key] || false}
                  onChange={(e) => updatePreferences({
                    notifications: {
                      ...preferences?.notifications,
                      [setting.key]: e.target.checked
                    }
                  })}
                  className="rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Display Preferences */}
        <div className="space-y-3">
          <h3 className="font-medium text-white">Display</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Dark Mode</span>
              <input
                type="checkbox"
                checked={preferences?.darkMode !== false}
                onChange={(e) => updatePreferences({ darkMode: e.target.checked })}
                className="rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Compact View</span>
              <input
                type="checkbox"
                checked={preferences?.compactView || false}
                onChange={(e) => updatePreferences({ compactView: e.target.checked })}
                className="rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
              />
            </label>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={sidebarClass}>
        {renderContent()}
      </div>
    </>
  )
}

UnifiedSidebar.propTypes = {
  position: PropTypes.oneOf(['left', 'right']),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['filter', 'insights', 'settings']),
  className: PropTypes.string
}

export default UnifiedSidebar