// ===============================================
// SESSION MANAGEMENT UTILITIES
// Enhanced session handling and persistence
// ===============================================

import { supabase } from '../config/supabase'

// Session storage keys
const SESSION_KEYS = {
  USER_PREFERENCES: 'arebet-user-preferences',
  RECENT_SEARCHES: 'arebet-recent-searches',
  FAVORITE_TEAMS: 'arebet-favorite-teams',
  DASHBOARD_STATE: 'arebet-dashboard-state',
  FILTER_STATE: 'arebet-filter-state'
}

// Session storage utilities
export const sessionStorage = {
  get: (key) => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return null
    }
  },

  set: (key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('Error writing to localStorage:', error)
      return false
    }
  },

  remove: (key) => {
    try {
      window.localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Error removing from localStorage:', error)
      return false
    }
  },

  clear: () => {
    try {
      // Only clear AreBet-specific keys
      Object.values(SESSION_KEYS).forEach(key => {
        window.localStorage.removeItem(key)
      })
      return true
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      return false
    }
  }
}

// User session management
export class SessionManager {
  constructor() {
    this.user = null
    this.sessionTimeout = null
    this.isOnline = navigator.onLine
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true
      this.syncOfflineData()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
    })

    // Listen for storage events (cross-tab sync)
    window.addEventListener('storage', (e) => {
      if (e.key?.startsWith('arebet-')) {
        this.handleCrossTabSync(e)
      }
    })

    // Listen for beforeunload to cleanup
    window.addEventListener('beforeunload', () => {
      this.cleanup()
    })
  }

  // Initialize session with user data
  initialize(user, userProfile = null) {
    this.user = user
    
    if (user) {
      this.startSessionTimeout()
      this.loadUserPreferences(userProfile)
    } else {
      this.clearSession()
    }
  }

  // Session timeout management
  startSessionTimeout() {
    this.clearSessionTimeout()
    
    // Auto-logout after 24 hours of inactivity
    this.sessionTimeout = setTimeout(async () => {
      console.log('Session expired - logging out')
      await this.logout()
    }, 24 * 60 * 60 * 1000) // 24 hours
  }

  clearSessionTimeout() {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout)
      this.sessionTimeout = null
    }
  }

  // Extend session on user activity
  extendSession() {
    if (this.user) {
      this.startSessionTimeout()
    }
  }

  // Load user preferences from storage or profile
  loadUserPreferences(userProfile) {
    if (!this.user) return

    let preferences = sessionStorage.get(SESSION_KEYS.USER_PREFERENCES)
    
    // Merge with server-side preferences if available
    if (userProfile?.preferences) {
      preferences = {
        ...preferences,
        ...userProfile.preferences
      }
      this.saveUserPreferences(preferences)
    }

    return preferences
  }

  // Save user preferences
  saveUserPreferences(preferences) {
    if (!this.user) return false
    return sessionStorage.set(SESSION_KEYS.USER_PREFERENCES, preferences)
  }

  // Recent searches management
  addRecentSearch(searchTerm) {
    if (!searchTerm?.trim()) return

    const recent = sessionStorage.get(SESSION_KEYS.RECENT_SEARCHES) || []
    const filtered = recent.filter(term => term.toLowerCase() !== searchTerm.toLowerCase())
    const updated = [searchTerm, ...filtered].slice(0, 10) // Keep last 10 searches

    return sessionStorage.set(SESSION_KEYS.RECENT_SEARCHES, updated)
  }

  getRecentSearches() {
    return sessionStorage.get(SESSION_KEYS.RECENT_SEARCHES) || []
  }

  clearRecentSearches() {
    return sessionStorage.remove(SESSION_KEYS.RECENT_SEARCHES)
  }

  // Favorite teams management
  addFavoriteTeam(team) {
    if (!team?.id) return false

    const favorites = sessionStorage.get(SESSION_KEYS.FAVORITE_TEAMS) || []
    const exists = favorites.some(fav => fav.id === team.id)
    
    if (!exists) {
      const updated = [...favorites, { ...team, addedAt: Date.now() }]
      return sessionStorage.set(SESSION_KEYS.FAVORITE_TEAMS, updated)
    }
    
    return false
  }

  removeFavoriteTeam(teamId) {
    const favorites = sessionStorage.get(SESSION_KEYS.FAVORITE_TEAMS) || []
    const filtered = favorites.filter(team => team.id !== teamId)
    return sessionStorage.set(SESSION_KEYS.FAVORITE_TEAMS, filtered)
  }

  getFavoriteTeams() {
    return sessionStorage.get(SESSION_KEYS.FAVORITE_TEAMS) || []
  }

  isFavoriteTeam(teamId) {
    const favorites = this.getFavoriteTeams()
    return favorites.some(team => team.id === teamId)
  }

  // Dashboard state management
  saveDashboardState(state) {
    return sessionStorage.set(SESSION_KEYS.DASHBOARD_STATE, {
      ...state,
      timestamp: Date.now()
    })
  }

  getDashboardState() {
    const state = sessionStorage.get(SESSION_KEYS.DASHBOARD_STATE)
    
    // Return state only if it's less than 1 hour old
    if (state && Date.now() - state.timestamp < 60 * 60 * 1000) {
      return state
    }
    
    return null
  }

  // Filter state management
  saveFilterState(filters) {
    return sessionStorage.set(SESSION_KEYS.FILTER_STATE, {
      ...filters,
      timestamp: Date.now()
    })
  }

  getFilterState() {
    return sessionStorage.get(SESSION_KEYS.FILTER_STATE)
  }

  // Cross-tab synchronization
  handleCrossTabSync(event) {
    const { key, newValue } = event
    
    if (key === SESSION_KEYS.USER_PREFERENCES && newValue) {
      // Notify other parts of the app about preference changes
      window.dispatchEvent(new CustomEvent('preferencesChanged', {
        detail: JSON.parse(newValue)
      }))
    }
  }

  // Offline data management
  async syncOfflineData() {
    if (!this.isOnline || !this.user) return

    try {
      // Sync any offline changes when back online
      const offlineData = sessionStorage.get('arebet-offline-data')
      if (offlineData && offlineData.length > 0) {
        // Process offline data sync
        console.log('Syncing offline data...', offlineData)
        sessionStorage.remove('arebet-offline-data')
      }
    } catch (error) {
      console.error('Error syncing offline data:', error)
    }
  }

  // Session validation
  async validateSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        this.clearSession()
        return false
      }

      // Check if session is close to expiry (within 5 minutes)
      const expiryTime = new Date(session.expires_at * 1000)
      const now = new Date()
      const timeUntilExpiry = expiryTime.getTime() - now.getTime()

      if (timeUntilExpiry < 5 * 60 * 1000) { // 5 minutes
        await this.refreshSession()
      }

      return true
    } catch (error) {
      console.error('Error validating session:', error)
      return false
    }
  }

  // Session refresh
  async refreshSession() {
    try {
      const { data: _data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Error refreshing session:', error)
        await this.logout()
        return false
      }

      return true
    } catch (error) {
      console.error('Error refreshing session:', error)
      return false
    }
  }

  // Logout and cleanup
  async logout() {
    this.clearSessionTimeout()
    this.clearSession()
    
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  // Clear session data
  clearSession() {
    this.user = null
    this.clearSessionTimeout()
    sessionStorage.clear()
  }

  // Cleanup on app close
  cleanup() {
    this.clearSessionTimeout()
  }

  // Activity tracking
  trackActivity() {
    this.extendSession()
    
    // Update last activity timestamp
    sessionStorage.set('arebet-last-activity', Date.now())
  }

  getLastActivity() {
    return sessionStorage.get('arebet-last-activity')
  }
}

// Create singleton instance
export const sessionManager = new SessionManager()

// Activity tracker setup
let activityTimeout = null

const trackUserActivity = () => {
  sessionManager.trackActivity()
  
  // Debounce activity tracking
  if (activityTimeout) clearTimeout(activityTimeout)
  activityTimeout = setTimeout(() => {
    sessionManager.extendSession()
  }, 1000)
}

// Listen for user activity
const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
events.forEach(event => {
  document.addEventListener(event, trackUserActivity, true)
})

// Export utilities
export { SESSION_KEYS }
export default {
  sessionStorage,
  SessionManager,
  sessionManager,
  SESSION_KEYS
}