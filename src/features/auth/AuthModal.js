// ===============================================
// AUTH MODAL COMPONENT
// Modal wrapper for login/signup forms
// ===============================================

import React, { useState } from 'react'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'

export const AuthModal = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const [mode, setMode] = useState(defaultMode)

  const handleSuccess = () => {
    onClose()
  }

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative z-50 w-full">
          {mode === 'login' ? (
            <LoginForm 
              onToggleMode={toggleMode}
              onSuccess={handleSuccess}
            />
          ) : (
            <SignupForm 
              onToggleMode={toggleMode}
              onSuccess={handleSuccess}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthModal