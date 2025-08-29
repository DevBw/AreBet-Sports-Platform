// ===============================================
// ROUTE UTILITIES
// Helpers for defining and managing protected routes
// ===============================================

import React from 'react'
import { RouteGuard } from '../components'

// Route protection levels
export const ROUTE_PROTECTION = {
  PUBLIC: 'public',
  AUTH_REQUIRED: 'auth_required',
  PREMIUM_REQUIRED: 'premium_required', 
  ELITE_REQUIRED: 'elite_required',
  GUEST_ONLY: 'guest_only'
}

// Create a protected route configuration
export const createProtectedRoute = (component, protection = ROUTE_PROTECTION.PUBLIC, options = {}) => {
  const WrappedComponent = (props) => {
    switch (protection) {
      case ROUTE_PROTECTION.AUTH_REQUIRED:
        return (
          <RouteGuard requireAuth={true} {...options}>
            {React.createElement(component, props)}
          </RouteGuard>
        )
      
      case ROUTE_PROTECTION.PREMIUM_REQUIRED:
        return (
          <RouteGuard requireAuth={true} requireFeature="premium" {...options}>
            {React.createElement(component, props)}
          </RouteGuard>
        )
      
      case ROUTE_PROTECTION.ELITE_REQUIRED:
        return (
          <RouteGuard requireAuth={true} requireFeature="elite" {...options}>
            {React.createElement(component, props)}
          </RouteGuard>
        )
      
      case ROUTE_PROTECTION.GUEST_ONLY:
        return (
          <RouteGuard guestOnly={true} {...options}>
            {React.createElement(component, props)}
          </RouteGuard>
        )
      
      case ROUTE_PROTECTION.PUBLIC:
      default:
        return React.createElement(component, props)
    }
  }
  
  WrappedComponent.displayName = `ProtectedRoute(${component.displayName || component.name})`
  return WrappedComponent
}

// Route definitions helper
export const defineRoutes = (routeConfigs) => {
  return routeConfigs.map(({ path, component, protection, ...options }) => ({
    path,
    element: createProtectedRoute(component, protection, options),
    ...options
  }))
}

// Common route patterns
export const COMMON_ROUTES = {
  // Public routes accessible to everyone
  public: (component) => createProtectedRoute(component, ROUTE_PROTECTION.PUBLIC),
  
  // Routes that require authentication
  protected: (component) => createProtectedRoute(component, ROUTE_PROTECTION.AUTH_REQUIRED),
  
  // Routes that require premium subscription
  premium: (component) => createProtectedRoute(component, ROUTE_PROTECTION.PREMIUM_REQUIRED),
  
  // Routes that require elite subscription
  elite: (component) => createProtectedRoute(component, ROUTE_PROTECTION.ELITE_REQUIRED),
  
  // Routes only accessible to non-authenticated users (login, signup)
  guestOnly: (component) => createProtectedRoute(component, ROUTE_PROTECTION.GUEST_ONLY)
}

// Subscription tier checker
export const getRequiredTier = (route) => {
  if (route.protection === ROUTE_PROTECTION.ELITE_REQUIRED) return 'elite'
  if (route.protection === ROUTE_PROTECTION.PREMIUM_REQUIRED) return 'premium'
  if (route.protection === ROUTE_PROTECTION.AUTH_REQUIRED) return 'free'
  return null
}

// Check if user can access route
export const canAccessRoute = (route, user, hasFeature) => {
  switch (route.protection) {
    case ROUTE_PROTECTION.AUTH_REQUIRED:
      return !!user
    
    case ROUTE_PROTECTION.PREMIUM_REQUIRED:
      return user && hasFeature('premium')
    
    case ROUTE_PROTECTION.ELITE_REQUIRED:
      return user && hasFeature('elite')
    
    case ROUTE_PROTECTION.GUEST_ONLY:
      return !user
    
    case ROUTE_PROTECTION.PUBLIC:
    default:
      return true
  }
}

export default {
  ROUTE_PROTECTION,
  createProtectedRoute,
  defineRoutes,
  COMMON_ROUTES,
  getRequiredTier,
  canAccessRoute
}