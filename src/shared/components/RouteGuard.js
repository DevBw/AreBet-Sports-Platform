// ===============================================
// ROUTE GUARD COMPONENT
// Higher-order component for route-level auth protection
// ===============================================

import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { useAuth } from '../hooks/useAuth'
import { Navigate, useLocation } from 'react-router-dom'

const RouteGuard = memo(({ 
  children, 
  requireAuth = false,
  requireFeature = null,
  redirectTo = '/dashboard',
  guestOnly = false 
}) => {
  const { user, loading, hasFeature } = useAuth()
  const location = useLocation()

  // Show nothing while loading
  if (loading) {
    return null
  }

  // Guest-only routes (like login/signup) - redirect authenticated users
  if (guestOnly && user) {
    return <Navigate to={redirectTo} replace />
  }

  // Protected routes - redirect unauthenticated users
  if (requireAuth && !user) {
    // Store the attempted location for redirect after login
    return <Navigate 
      to="/dashboard" 
      state={{ from: location }} 
      replace 
    />
  }

  // Feature-gated routes
  if (requireFeature && user && !hasFeature(requireFeature)) {
    return <Navigate to="/upgrade" replace />
  }

  return children
})

RouteGuard.displayName = 'RouteGuard'

RouteGuard.propTypes = {
  children: PropTypes.node.isRequired,
  requireAuth: PropTypes.bool,
  requireFeature: PropTypes.oneOf([null, 'premium', 'elite']),
  redirectTo: PropTypes.string,
  guestOnly: PropTypes.bool
}

export default RouteGuard