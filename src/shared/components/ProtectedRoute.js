// ===============================================
// PROTECTED ROUTE COMPONENT
// Route wrapper that requires authentication
// ===============================================

import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { useAuth } from '../hooks/useAuth'
import { AuthModal } from '../../features/auth'
import LoadingSpinner from './LoadingSpinner'

const ProtectedRoute = memo(({ 
  children, 
  requireAuth = true, 
  requireFeature = null,
  fallbackComponent = null,
  showAuthModal = true 
}) => {
  const { user, loading, hasFeature } = useAuth()
  const [showAuth, setShowAuth] = React.useState(false)

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Check authentication requirement
  if (requireAuth && !user) {
    if (fallbackComponent) {
      return fallbackComponent
    }

    if (showAuthModal) {
      return (
        <>
          <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Premium Content</h2>
                <p className="text-gray-300 mb-6">
                  Sign in to access exclusive betting insights and analytics
                </p>
                <button
                  onClick={() => setShowAuth(true)}
                  className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Sign In to Continue
                </button>
              </div>
            </div>
          </div>
          <AuthModal 
            isOpen={showAuth} 
            onClose={() => setShowAuth(false)} 
            defaultMode="login"
          />
        </>
      )
    }

    return null
  }

  // Check feature requirement
  if (requireFeature && !hasFeature(requireFeature)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Premium Feature</h2>
            <p className="text-gray-300 mb-6">
              This feature requires a {requireFeature} subscription to access advanced analytics and predictions.
            </p>
            <button
              onClick={() => {
                // Navigate to upgrade page - will implement later
                console.log('Navigate to upgrade page')
              }}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-gray-900 font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105"
            >
              Upgrade to {requireFeature}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // User is authenticated and has required features
  return children
})

ProtectedRoute.displayName = 'ProtectedRoute'

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireAuth: PropTypes.bool,
  requireFeature: PropTypes.oneOf([null, 'premium', 'elite']),
  fallbackComponent: PropTypes.node,
  showAuthModal: PropTypes.bool
}

export default ProtectedRoute