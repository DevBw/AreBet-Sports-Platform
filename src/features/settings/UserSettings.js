// ===============================================
// USER SETTINGS COMPONENT
// Detailed user preferences and app configuration
// ===============================================

import React, { useState, memo, useEffect } from 'react'
import { useAuth } from '../../shared/hooks/useAuth'
import { Button, Card, Icon } from '../../shared/components'
import { showErrorNotification } from '../../shared/utils/errorUtils'
import { createNotification } from '../../shared/components/NotificationSystem'

const UserSettings = memo(() => {
  const { user, userProfile, updateProfile } = useAuth()
  const [settings, setSettings] = useState({
    // Display preferences
    theme: 'dark',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    
    // Notification preferences
    emailNotifications: true,
    pushNotifications: true,
    matchAlerts: true,
    predictionAlerts: false,
    weeklyDigest: true,
    marketingEmails: false,
    
    // Content preferences
    favoriteLeagues: [],
    favoriteTeams: [],
    defaultView: 'live',
    matchesPerPage: 20,
    autoRefresh: true,
    refreshInterval: 30,
    
    // Privacy preferences
    profileVisibility: 'private',
    shareStatistics: false,
    allowAnalytics: true,
    
    // Advanced preferences
    apiAccess: false,
    developerMode: false,
    betaFeatures: false
  })
  
  const [loading, setLoading] = useState(false)
  const [activeSection, setActiveSection] = useState('display')

  // Load user settings on mount
  useEffect(() => {
    if (userProfile?.preferences) {
      setSettings(prev => ({
        ...prev,
        ...userProfile.preferences
      }))
    }
  }, [userProfile])

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleArrayToggle = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: prev[key].includes(value) 
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }))
  }

  const saveSettings = async () => {
    setLoading(true)
    
    try {
      const { error } = await updateProfile({
        preferences: settings,
        updated_at: new Date().toISOString()
      })

      if (error) {
        showErrorNotification(new Error(error))
      } else {
        createNotification({
          type: 'success',
          title: 'Settings Saved',
          message: 'Settings saved successfully!'
        })
      }
    } catch (err) {
      showErrorNotification(err)
    } finally {
      setLoading(false)
    }
  }

  const resetSettings = () => {
    setSettings({
      theme: 'dark',
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      emailNotifications: true,
      pushNotifications: true,
      matchAlerts: true,
      predictionAlerts: false,
      weeklyDigest: true,
      marketingEmails: false,
      favoriteLeagues: [],
      favoriteTeams: [],
      defaultView: 'live',
      matchesPerPage: 20,
      autoRefresh: true,
      refreshInterval: 30,
      profileVisibility: 'private',
      shareStatistics: false,
      allowAnalytics: true,
      apiAccess: false,
      developerMode: false,
      betaFeatures: false
    })
  }

  const sections = [
    { id: 'display', label: 'Display', icon: 'monitor' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
    { id: 'content', label: 'Content', icon: 'grid' },
    { id: 'privacy', label: 'Privacy', icon: 'shield' },
    { id: 'advanced', label: 'Advanced', icon: 'settings' }
  ]

  const popularLeagues = [
    'Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1',
    'Champions League', 'Europa League', 'World Cup', 'Euro Cup'
  ]

  const timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Europe/Berlin', label: 'Berlin (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' }
  ]

  const renderDisplaySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
        <div className="grid grid-cols-2 gap-3">
          {['dark', 'light'].map(theme => (
            <button
              key={theme}
              onClick={() => handleSettingChange('theme', theme)}
              className={`p-3 rounded-lg text-sm font-medium transition-colors border ${
                settings.theme === theme
                  ? 'bg-yellow-500 text-gray-900 border-yellow-500'
                  : 'bg-gray-800/50 text-gray-300 border-gray-600 hover:bg-gray-700/50'
              }`}
            >
              <Icon name={theme === 'dark' ? 'moon' : 'sun'} className="w-4 h-4 mr-2" />
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
        <select
          value={settings.timezone}
          onChange={(e) => handleSettingChange('timezone', e.target.value)}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
        >
          {timezones.map(tz => (
            <option key={tz.value} value={tz.value}>{tz.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Date Format</label>
          <select
            value={settings.dateFormat}
            onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Time Format</label>
          <select
            value={settings.timeFormat}
            onChange={(e) => handleSettingChange('timeFormat', e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
          >
            <option value="24h">24 Hour</option>
            <option value="12h">12 Hour (AM/PM)</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Push Notifications</h3>
        
        {[
          { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive browser notifications' },
          { key: 'matchAlerts', label: 'Match Alerts', description: 'Live match updates and goals' },
          { key: 'predictionAlerts', label: 'Prediction Alerts', description: 'New predictions for followed teams' }
        ].map(({ key, label, description }) => (
          <label key={key} className="flex items-start">
            <input
              type="checkbox"
              checked={settings[key]}
              onChange={(e) => handleSettingChange(key, e.target.checked)}
              className="mt-1 rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
            />
            <div className="ml-3">
              <span className="text-white font-medium">{label}</span>
              <p className="text-sm text-gray-400">{description}</p>
            </div>
          </label>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Email Notifications</h3>
        
        {[
          { key: 'emailNotifications', label: 'Email Notifications', description: 'Match updates via email' },
          { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Summary of your favorite teams' },
          { key: 'marketingEmails', label: 'Marketing Emails', description: 'Product updates and promotions' }
        ].map(({ key, label, description }) => (
          <label key={key} className="flex items-start">
            <input
              type="checkbox"
              checked={settings[key]}
              onChange={(e) => handleSettingChange(key, e.target.checked)}
              className="mt-1 rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
            />
            <div className="ml-3">
              <span className="text-white font-medium">{label}</span>
              <p className="text-sm text-gray-400">{description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  )

  const renderContentSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Favorite Leagues</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {popularLeagues.map(league => (
            <button
              key={league}
              onClick={() => handleArrayToggle('favoriteLeagues', league)}
              className={`p-3 rounded-lg text-sm font-medium transition-colors border ${
                settings.favoriteLeagues.includes(league)
                  ? 'bg-yellow-500 text-gray-900 border-yellow-500'
                  : 'bg-gray-800/50 text-gray-300 border-gray-600 hover:bg-gray-700/50'
              }`}
            >
              {league}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Default View</label>
          <select
            value={settings.defaultView}
            onChange={(e) => handleSettingChange('defaultView', e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
          >
            <option value="live">Live Matches</option>
            <option value="today">Today's Matches</option>
            <option value="fixtures">All Fixtures</option>
            <option value="dashboard">Dashboard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Matches Per Page</label>
          <select
            value={settings.matchesPerPage}
            onChange={(e) => handleSettingChange('matchesPerPage', parseInt(e.target.value))}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.autoRefresh}
            onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
            className="rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
          />
          <span className="ml-3 text-white font-medium">Auto-refresh live scores</span>
        </label>

        {settings.autoRefresh && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Refresh Interval (seconds)
            </label>
            <select
              value={settings.refreshInterval}
              onChange={(e) => handleSettingChange('refreshInterval', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
            >
              <option value={15}>15 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
              <option value={120}>2 minutes</option>
            </select>
          </div>
        )}
      </div>
    </div>
  )

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Profile Visibility</label>
        <select
          value={settings.profileVisibility}
          onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
        >
          <option value="private">Private</option>
          <option value="friends">Friends Only</option>
          <option value="public">Public</option>
        </select>
      </div>

      <div className="space-y-4">
        {[
          { key: 'shareStatistics', label: 'Share Statistics', description: 'Allow others to see your prediction accuracy' },
          { key: 'allowAnalytics', label: 'Usage Analytics', description: 'Help improve AreBet by sharing anonymous usage data' }
        ].map(({ key, label, description }) => (
          <label key={key} className="flex items-start">
            <input
              type="checkbox"
              checked={settings[key]}
              onChange={(e) => handleSettingChange(key, e.target.checked)}
              className="mt-1 rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
            />
            <div className="ml-3">
              <span className="text-white font-medium">{label}</span>
              <p className="text-sm text-gray-400">{description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  )

  const renderAdvancedSettings = () => (
    <div className="space-y-6">
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <Icon name="alert-triangle" className="w-5 h-5 text-yellow-500 mr-2" />
          <h3 className="text-lg font-medium text-white">Advanced Settings</h3>
        </div>
        <p className="text-sm text-gray-300">
          These settings are for advanced users only. Changing them may affect app functionality.
        </p>
      </div>

      <div className="space-y-4">
        {[
          { key: 'apiAccess', label: 'API Access', description: 'Enable API tokens for external access' },
          { key: 'developerMode', label: 'Developer Mode', description: 'Show debug information and additional logs' },
          { key: 'betaFeatures', label: 'Beta Features', description: 'Access experimental features before public release' }
        ].map(({ key, label, description }) => (
          <label key={key} className="flex items-start">
            <input
              type="checkbox"
              checked={settings[key]}
              onChange={(e) => handleSettingChange(key, e.target.checked)}
              className="mt-1 rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
            />
            <div className="ml-3">
              <span className="text-white font-medium">{label}</span>
              <p className="text-sm text-gray-400">{description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  )

  if (!user) {
    return (
      <div className="text-center py-12">
        <Icon name="settings" className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-medium text-gray-400">Please sign in to access settings</h2>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Customize your AreBet experience</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-2">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-yellow-500 text-gray-900 font-medium'
                    : 'text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                <Icon name={section.icon} className="w-5 h-5 mr-3" />
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <Card className="p-6 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50">
            {activeSection === 'display' && renderDisplaySettings()}
            {activeSection === 'notifications' && renderNotificationSettings()}
            {activeSection === 'content' && renderContentSettings()}
            {activeSection === 'privacy' && renderPrivacySettings()}
            {activeSection === 'advanced' && renderAdvancedSettings()}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-700">
              <Button
                onClick={saveSettings}
                variant="primary"
                loading={loading}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
              
              <Button
                onClick={resetSettings}
                variant="secondary"
                disabled={loading}
                className="flex-1"
              >
                Reset to Defaults
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
})

UserSettings.displayName = 'UserSettings'

export default UserSettings