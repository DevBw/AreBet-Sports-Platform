// ===============================================
// PREMIUM GATE COMPONENT
// Subscription-aware content gating with upgrade prompts
// ===============================================

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useAuth } from '../hooks/useAuth'
import SubscriptionModal from '../../features/subscription/SubscriptionModal'
import Button from './Button'
import Card from './Card'

export const PremiumGate = ({ 
  feature, 
  children, 
  fallback,
  requiredTier = 'pro',
  title,
  description,
  benefits = [],
  className = ''
}) => {
  const { hasFeature } = useAuth()
  const [subscriptionModal, setSubscriptionModal] = useState(false)
  
  // Check if user has access to this feature
  const hasAccess = hasFeature(feature)
  
  if (hasAccess) {
    return children
  }

  // If custom fallback is provided, use it
  if (fallback) {
    return fallback
  }

  // Default upgrade prompt
  const tierConfig = {
    pro: {
      name: 'Pro Bettor',
      price: '$9.99',
      gradient: 'from-cyan-500 to-blue-500',
      icon: '⚡'
    },
    elite: {
      name: 'Elite Analytics',
      price: '$29.99',
      gradient: 'from-amber-500 to-orange-500',
      icon: '🎯'
    }
  }

  const config = tierConfig[requiredTier] || tierConfig.pro

  const defaultBenefits = {
    pro: [
      'AI-powered match predictions',
      'Advanced team statistics',
      'Injury impact analysis',
      'Head-to-head insights',
      'Real-time notifications'
    ],
    elite: [
      'Value bet detection',
      'Historical trend analysis',
      'Custom alert system',
      'Priority support',
      'Advanced API access'
    ]
  }

  const featureBenefits = benefits.length ? benefits : defaultBenefits[requiredTier] || []

  return (
    <div className={`relative ${className}`}>
      {/* Blurred Preview */}
      <div className="relative">
        <div className="filter blur-sm opacity-50 pointer-events-none select-none">
          {children}
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent">
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="max-w-md mx-4 text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${config.gradient} flex items-center justify-center text-2xl`}>
                {config.icon}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {title || `Upgrade to ${config.name}`}
              </h3>
              
              <p className="text-gray-600 mb-4">
                {description || `Unlock advanced betting insights and analytics with ${config.name}.`}
              </p>
              
              {featureBenefits.length > 0 && (
                <ul className="text-sm text-gray-700 mb-6 space-y-2">
                  {featureBenefits.slice(0, 3).map((benefit, index) => (
                    <li key={index} className="flex items-center justify-center">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                      {benefit}
                    </li>
                  ))}
                  {featureBenefits.length > 3 && (
                    <li className="text-gray-500">+ {featureBenefits.length - 3} more features</li>
                  )}
                </ul>
              )}
              
              <div className="space-y-2">
                <Button
                  variant="premium"
                  size="medium"
                  onClick={() => setSubscriptionModal(true)}
                  className="w-full"
                >
                  Upgrade to {config.name} - {config.price}/month
                </Button>
                
                <button 
                  className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                  onClick={() => setSubscriptionModal(true)}
                >
                  Start 7-day free trial
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={subscriptionModal}
        onClose={() => setSubscriptionModal(false)}
        defaultTier={requiredTier}
      />
    </div>
  )
}

// Quick premium badge component
export const PremiumBadge = ({ tier = 'pro', className = '' }) => {
  const tierConfig = {
    pro: { text: 'PRO', gradient: 'from-cyan-500 to-blue-500' },
    elite: { text: 'ELITE', gradient: 'from-amber-500 to-orange-500' }
  }
  
  const config = tierConfig[tier] || tierConfig.pro
  
  return (
    <span className={`
      inline-flex items-center px-2 py-1 rounded-full text-xs font-bold text-white
      bg-gradient-to-r ${config.gradient} shadow-sm ${className}
    `}>
      {config.text}
    </span>
  )
}

// Feature teaser component (shows what's locked)
export const FeatureTeaser = ({ 
  feature, 
  title, 
  description, 
  requiredTier = 'pro',
  className = '' 
}) => {
  const { hasFeature } = useAuth()
  const [subscriptionModal, setSubscriptionModal] = useState(false)
  
  if (hasFeature(feature)) {
    return null // Don't show teaser if user has access
  }
  
  
  return (
    <>
      <div className={`p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-700">{title}</h4>
              <PremiumBadge tier={requiredTier} />
            </div>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
          <Button
            variant="outline"
            size="small"
            onClick={() => setSubscriptionModal(true)}
          >
            Unlock
          </Button>
        </div>
      </div>
      
      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={subscriptionModal}
        onClose={() => setSubscriptionModal(false)}
        defaultTier={requiredTier}
      />
    </>
  )
}

PremiumGate.propTypes = {
  feature: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  requiredTier: PropTypes.oneOf(['pro', 'elite']),
  title: PropTypes.string,
  description: PropTypes.string,
  benefits: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string
}

PremiumBadge.propTypes = {
  tier: PropTypes.oneOf(['pro', 'elite']),
  className: PropTypes.string
}

FeatureTeaser.propTypes = {
  feature: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  requiredTier: PropTypes.oneOf(['pro', 'elite']),
  className: PropTypes.string
}

export default PremiumGate