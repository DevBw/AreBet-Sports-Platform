// ===============================================
// AUTH REQUIRED HOC
// Higher-order component for wrapping components that require authentication
// ===============================================

import React from 'react'
import ProtectedRoute from './ProtectedRoute'

// Higher-order component that wraps a component with auth protection
export const withAuthRequired = (WrappedComponent, options = {}) => {
  const AuthRequiredComponent = (props) => (
    <ProtectedRoute 
      requireAuth={true}
      requireFeature={options.requireFeature}
      showAuthModal={options.showAuthModal !== false}
    >
      <WrappedComponent {...props} />
    </ProtectedRoute>
  )

  AuthRequiredComponent.displayName = `withAuthRequired(${WrappedComponent.displayName || WrappedComponent.name})`
  
  return AuthRequiredComponent
}

// Higher-order component for premium features
export const withPremiumRequired = (WrappedComponent) => {
  return withAuthRequired(WrappedComponent, { requireFeature: 'premium' })
}

// Higher-order component for elite features
export const withEliteRequired = (WrappedComponent) => {
  return withAuthRequired(WrappedComponent, { requireFeature: 'elite' })
}

// Simple component wrapper for inline use
export const AuthRequired = ({ children, ...props }) => (
  <ProtectedRoute requireAuth={true} {...props}>
    {children}
  </ProtectedRoute>
)

// Premium feature wrapper
export const PremiumRequired = ({ children, ...props }) => (
  <ProtectedRoute requireAuth={true} requireFeature="premium" {...props}>
    {children}
  </ProtectedRoute>
)

// Elite feature wrapper
export const EliteRequired = ({ children, ...props }) => (
  <ProtectedRoute requireAuth={true} requireFeature="elite" {...props}>
    {children}
  </ProtectedRoute>
)

const AuthRequiredUtils = {
  withAuthRequired,
  withPremiumRequired,
  withEliteRequired,
  AuthRequired,
  PremiumRequired,
  EliteRequired
}

export default AuthRequiredUtils