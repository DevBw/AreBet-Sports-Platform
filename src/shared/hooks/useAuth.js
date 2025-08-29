// ===============================================
// AUTHENTICATION HOOK
// Manages user authentication and subscription state
// ===============================================

import { useState, useEffect, useContext, createContext } from 'react'
import { areBetService } from '../services/SupabaseServiceV2'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        await areBetService.initializeAuth()
        setUser(areBetService.currentUser)
        setUserProfile(areBetService.userProfile)
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const unsubscribe = areBetService.client.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      setUser(session?.user || null)
      
      if (session?.user) {
        await areBetService.loadUserProfile()
        setUserProfile(areBetService.userProfile)
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    return () => {
      unsubscribe?.data?.subscription?.unsubscribe()
    }
  }, [])

  const signUp = async (email, password, metadata) => {
    try {
      setLoading(true)
      const result = await areBetService.signUp(email, password, metadata)
      return result
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      const result = await areBetService.signIn(email, password)
      return result
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const result = await areBetService.signOut()
      setUser(null)
      setUserProfile(null)
      return result
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates) => {
    if (!user) return { error: 'No user logged in' }
    
    try {
      const { error } = await areBetService.client
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
      
      if (!error) {
        await areBetService.loadUserProfile()
        setUserProfile(areBetService.userProfile)
      }
      
      return { error }
    } catch (error) {
      return { error: error.message }
    }
  }

  // Subscription helpers
  const hasFeature = (feature) => areBetService.hasFeatureAccess(feature)
  const getSubscriptionTier = () => areBetService.userTier
  const getSubscriptionLimits = () => areBetService.getSubscriptionLimits()

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    hasFeature,
    getSubscriptionTier,
    getSubscriptionLimits,
    // Subscription state
    isPremium: areBetService.userTier !== 'free',
    isElite: areBetService.userTier === 'elite',
    subscriptionTier: areBetService.userTier
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default useAuth