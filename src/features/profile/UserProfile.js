// ===============================================
// USER PROFILE COMPONENT
// Comprehensive user profile management with settings
// ===============================================

import React, { useState, memo } from 'react'
import { useAuth } from '../../shared/hooks/useAuth'
import { Button, Card, Icon } from '../../shared/components'
import { validateForm, VALIDATION_SCHEMAS } from '../../shared/utils/validationUtils'
import { showErrorNotification } from '../../shared/utils/errorUtils'
import { createNotification } from '../../shared/components/NotificationSystem'

const UserProfile = memo(() => {
  const { user, userProfile, updateProfile, getSubscriptionTier, getSubscriptionLimits } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({
    fullName: userProfile?.full_name || '',
    email: user?.email || '',
    favoriteLeagues: userProfile?.favorite_leagues || [],
    favoriteTeams: userProfile?.favorite_teams || [],
    timezone: userProfile?.timezone || 'UTC',
    emailNotifications: userProfile?.email_notifications !== false,
    pushNotifications: userProfile?.push_notifications !== false
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const subscriptionTier = getSubscriptionTier()
  const subscriptionLimits = getSubscriptionLimits()

  const handleInputChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleArrayToggle = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    const validation = validateForm(formData, VALIDATION_SCHEMAS.profile)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const { error } = await updateProfile({
        full_name: formData.fullName,
        favorite_leagues: formData.favoriteLeagues,
        favorite_teams: formData.favoriteTeams,
        timezone: formData.timezone,
        email_notifications: formData.emailNotifications,
        push_notifications: formData.pushNotifications,
        updated_at: new Date().toISOString()
      })

      if (error) {
        setErrors({ general: error })
      } else {
        createNotification({
          type: 'success',
          title: 'Profile Updated',
          message: 'Profile updated successfully!'
        })
      }
    } catch (err) {
      showErrorNotification(err, {
        context: { component: 'UserProfile', action: 'updateProfile' }
      })
      setErrors({ general: 'Failed to update profile. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'user' },
    { id: 'preferences', label: 'Preferences', icon: 'settings' },
    { id: 'subscription', label: 'Subscription', icon: 'credit-card' }
  ]

  const popularLeagues = [
    'Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1',
    'Champions League', 'Europa League', 'World Cup', 'Euro Cup'
  ]

  const renderProfileTab = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Full Name
        </label>
        <input
          type="text"
          value={formData.fullName}
          onChange={handleInputChange('fullName')}
          className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-500 
            focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors
            ${errors.fullName ? 'border-red-500' : 'border-gray-600'}`}
          placeholder="Enter your full name"
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-400">{errors.fullName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Email Address
        </label>
        <input
          type="email"
          value={formData.email}
          disabled
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
        />
        <p className="mt-1 text-sm text-gray-400">
          Email cannot be changed. Contact support if needed.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Timezone
        </label>
        <select
          value={formData.timezone}
          onChange={handleInputChange('timezone')}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
          <option value="Europe/London">London</option>
          <option value="Europe/Paris">Paris</option>
          <option value="Europe/Berlin">Berlin</option>
          <option value="Asia/Tokyo">Tokyo</option>
        </select>
      </div>

      <Button
        type="submit"
        variant="primary"
        loading={loading}
        disabled={loading}
      >
        {loading ? 'Updating Profile...' : 'Update Profile'}
      </Button>
    </form>
  )

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Favorite Leagues</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {popularLeagues.map(league => (
            <button
              key={league}
              type="button"
              onClick={() => handleArrayToggle('favoriteLeagues', league)}
              className={`p-3 rounded-lg text-sm font-medium transition-colors border ${
                formData.favoriteLeagues.includes(league)
                  ? 'bg-yellow-500 text-gray-900 border-yellow-500'
                  : 'bg-gray-800/50 text-gray-300 border-gray-600 hover:bg-gray-700/50'
              }`}
            >
              {league}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Notifications</h3>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.emailNotifications}
              onChange={handleInputChange('emailNotifications')}
              className="rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
            />
            <span className="ml-3">
              <span className="text-white font-medium">Email Notifications</span>
              <span className="block text-sm text-gray-400">
                Receive match updates and insights via email
              </span>
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.pushNotifications}
              onChange={handleInputChange('pushNotifications')}
              className="rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
            />
            <span className="ml-3">
              <span className="text-white font-medium">Push Notifications</span>
              <span className="block text-sm text-gray-400">
                Live match alerts and breaking news
              </span>
            </span>
          </label>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        variant="primary"
        loading={loading}
        disabled={loading}
      >
        {loading ? 'Saving Preferences...' : 'Save Preferences'}
      </Button>
    </div>
  )

  const renderSubscriptionTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Current Plan</h3>
          <p className="text-gray-400">Manage your subscription and billing</p>
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
          subscriptionTier === 'elite' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
          subscriptionTier === 'premium' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900' :
          'bg-gray-700 text-gray-300'
        }`}>
          {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4 bg-gray-800/50 border border-gray-700/50">
          <h4 className="font-medium text-white mb-3">Usage This Month</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">API Calls</span>
                <span className="text-white">
                  {subscriptionLimits?.apiCalls?.used || 0} / {subscriptionLimits?.apiCalls?.limit || 'Unlimited'}
                </span>
              </div>
              {subscriptionLimits?.apiCalls?.limit && (
                <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min((subscriptionLimits.apiCalls.used / subscriptionLimits.apiCalls.limit) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              )}
            </div>
            
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Predictions</span>
                <span className="text-white">
                  {subscriptionLimits?.predictions?.used || 0} / {subscriptionLimits?.predictions?.limit || 'Unlimited'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gray-800/50 border border-gray-700/50">
          <h4 className="font-medium text-white mb-3">Plan Features</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <Icon name="check" className="w-4 h-4 text-green-400 mr-2" />
              <span className="text-gray-300">Live scores & fixtures</span>
            </div>
            {(subscriptionTier === 'premium' || subscriptionTier === 'elite') && (
              <>
                <div className="flex items-center">
                  <Icon name="check" className="w-4 h-4 text-green-400 mr-2" />
                  <span className="text-gray-300">AI predictions</span>
                </div>
                <div className="flex items-center">
                  <Icon name="check" className="w-4 h-4 text-green-400 mr-2" />
                  <span className="text-gray-300">Advanced analytics</span>
                </div>
              </>
            )}
            {subscriptionTier === 'elite' && (
              <>
                <div className="flex items-center">
                  <Icon name="check" className="w-4 h-4 text-green-400 mr-2" />
                  <span className="text-gray-300">Custom alerts</span>
                </div>
                <div className="flex items-center">
                  <Icon name="check" className="w-4 h-4 text-green-400 mr-2" />
                  <span className="text-gray-300">Priority support</span>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {subscriptionTier === 'free' && (
        <div className="text-center">
          <Button
            onClick={() => {
              // Navigate to upgrade page - will implement later
              console.log('Navigate to upgrade page')
            }}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-gray-900 font-semibold"
          >
            Upgrade to Premium
          </Button>
        </div>
      )}
    </div>
  )

  if (!user) {
    return (
      <div className="text-center py-12">
        <Icon name="user" className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-medium text-gray-400">Please sign in to view your profile</h2>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
        <p className="text-gray-400">Manage your profile and preferences</p>
      </div>

      {errors.general && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 rounded-lg">
          <p className="text-red-300 text-sm flex items-center">
            <Icon name="alert-circle" className="w-4 h-4 mr-2" />
            {errors.general}
          </p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tab Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-yellow-500 text-gray-900 font-medium'
                    : 'text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                <Icon name={tab.icon} className="w-5 h-5 mr-3" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          <Card className="p-6 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'preferences' && renderPreferencesTab()}
            {activeTab === 'subscription' && renderSubscriptionTab()}
          </Card>
        </div>
      </div>
    </div>
  )
})

UserProfile.displayName = 'UserProfile'

export default UserProfile