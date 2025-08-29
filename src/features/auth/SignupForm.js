// ===============================================
// SIGNUP FORM COMPONENT
// Registration form with subscription tier preview
// ===============================================

import React, { useState } from 'react'
import { useAuth } from '../../shared/hooks/useAuth'
import Button from '../../shared/components/Button'
import Card from '../../shared/components/Card'

export const SignupForm = ({ onToggleMode, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signUp } = useAuth()

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { error } = await signUp(
        formData.email, 
        formData.password,
        { full_name: formData.fullName }
      )
      
      if (error) {
        setError(error.message)
      } else {
        onSuccess?.()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
          Join AreBet
        </h2>
        <p className="text-gray-600 mt-2">
          Start with free insights, upgrade anytime
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="your@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="••••••••"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="••••••••"
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="w-full"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onToggleMode}
          className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
        >
          Already have an account? Sign in
        </button>
      </div>

      {/* Free tier preview */}
      <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-lg border">
        <p className="text-sm font-medium text-indigo-700 mb-1">Free Account Includes:</p>
        <ul className="text-xs text-indigo-600 space-y-1">
          <li>• Live scores and fixtures</li>
          <li>• Basic league standings</li>
          <li>• 100 API calls per day</li>
        </ul>
      </div>

      <div className="mt-2 text-center">
        <p className="text-xs text-gray-500">
          Upgrade later for predictions and advanced analytics
        </p>
      </div>
    </Card>
  )
}

export default SignupForm