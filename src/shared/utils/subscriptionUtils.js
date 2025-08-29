// ===============================================
// SUBSCRIPTION UTILITIES
// Enhanced subscription tier management and feature gating
// ===============================================

// Subscription tiers configuration
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium', // Changed from 'pro' to match UI
  ELITE: 'elite'
}

// Comprehensive feature definitions
export const FEATURES = {
  // Basic features (all tiers)
  BASIC_SCORES: 'basic_scores',
  BASIC_FIXTURES: 'basic_fixtures', 
  BASIC_STANDINGS: 'basic_standings',
  BASIC_TEAM_INFO: 'basic_team_info',

  // Premium features
  PREDICTIONS: 'predictions',
  ADVANCED_STATS: 'advanced_stats',
  INJURY_INSIGHTS: 'injury_insights',
  H2H_ANALYSIS: 'h2h_analysis',
  MATCH_INSIGHTS: 'match_insights',
  TEAM_FORM_ANALYSIS: 'team_form_analysis',
  
  // Elite features
  VALUE_BETS: 'value_bets',
  AI_PREDICTIONS: 'ai_predictions',
  HISTORICAL_TRENDS: 'historical_trends',
  CUSTOM_ALERTS: 'custom_alerts',
  PRIORITY_SUPPORT: 'priority_support',
  EXPORT_DATA: 'export_data',
  API_ACCESS: 'api_access',
  ADVANCED_FILTERING: 'advanced_filtering'
}

// Subscription limits and quotas
export const SUBSCRIPTION_LIMITS = {
  [SUBSCRIPTION_TIERS.FREE]: {
    apiQuota: 100,
    dailyRequests: 50,
    predictions: 0,
    alerts: 0,
    exportLimit: 0,
    features: [
      FEATURES.BASIC_SCORES,
      FEATURES.BASIC_FIXTURES,
      FEATURES.BASIC_STANDINGS,
      FEATURES.BASIC_TEAM_INFO
    ],
    realTime: false,
    priority: false,
    supportLevel: 'community'
  },
  
  [SUBSCRIPTION_TIERS.PREMIUM]: {
    apiQuota: 1000,
    dailyRequests: 500,
    predictions: 50,
    alerts: 10,
    exportLimit: 25,
    features: [
      // All free features
      FEATURES.BASIC_SCORES,
      FEATURES.BASIC_FIXTURES,
      FEATURES.BASIC_STANDINGS,
      FEATURES.BASIC_TEAM_INFO,
      // Premium features
      FEATURES.PREDICTIONS,
      FEATURES.ADVANCED_STATS,
      FEATURES.INJURY_INSIGHTS,
      FEATURES.H2H_ANALYSIS,
      FEATURES.MATCH_INSIGHTS,
      FEATURES.TEAM_FORM_ANALYSIS
    ],
    realTime: true,
    priority: false,
    supportLevel: 'email'
  },
  
  [SUBSCRIPTION_TIERS.ELITE]: {
    apiQuota: 5000,
    dailyRequests: 2000,
    predictions: 200,
    alerts: 50,
    exportLimit: 100,
    features: [
      // All free features
      FEATURES.BASIC_SCORES,
      FEATURES.BASIC_FIXTURES,
      FEATURES.BASIC_STANDINGS,
      FEATURES.BASIC_TEAM_INFO,
      // All premium features
      FEATURES.PREDICTIONS,
      FEATURES.ADVANCED_STATS,
      FEATURES.INJURY_INSIGHTS,
      FEATURES.H2H_ANALYSIS,
      FEATURES.MATCH_INSIGHTS,
      FEATURES.TEAM_FORM_ANALYSIS,
      // Elite features
      FEATURES.VALUE_BETS,
      FEATURES.AI_PREDICTIONS,
      FEATURES.HISTORICAL_TRENDS,
      FEATURES.CUSTOM_ALERTS,
      FEATURES.PRIORITY_SUPPORT,
      FEATURES.EXPORT_DATA,
      FEATURES.API_ACCESS,
      FEATURES.ADVANCED_FILTERING
    ],
    realTime: true,
    priority: true,
    supportLevel: 'priority'
  }
}

// Helper functions for subscription management
export const getSubscriptionLimits = (tier) => {
  return SUBSCRIPTION_LIMITS[tier] || SUBSCRIPTION_LIMITS[SUBSCRIPTION_TIERS.FREE]
}

export const hasFeatureAccess = (userTier, feature) => {
  const limits = getSubscriptionLimits(userTier)
  return limits.features.includes(feature)
}

export const canUpgradeFrom = (currentTier) => {
  switch (currentTier) {
    case SUBSCRIPTION_TIERS.FREE:
      return [SUBSCRIPTION_TIERS.PREMIUM, SUBSCRIPTION_TIERS.ELITE]
    case SUBSCRIPTION_TIERS.PREMIUM:
      return [SUBSCRIPTION_TIERS.ELITE]
    case SUBSCRIPTION_TIERS.ELITE:
      return []
    default:
      return [SUBSCRIPTION_TIERS.PREMIUM, SUBSCRIPTION_TIERS.ELITE]
  }
}

export const getNextTier = (currentTier) => {
  switch (currentTier) {
    case SUBSCRIPTION_TIERS.FREE:
      return SUBSCRIPTION_TIERS.PREMIUM
    case SUBSCRIPTION_TIERS.PREMIUM:
      return SUBSCRIPTION_TIERS.ELITE
    case SUBSCRIPTION_TIERS.ELITE:
      return null
    default:
      return SUBSCRIPTION_TIERS.PREMIUM
  }
}

export const getTierDisplayName = (tier) => {
  switch (tier) {
    case SUBSCRIPTION_TIERS.FREE:
      return 'Free'
    case SUBSCRIPTION_TIERS.PREMIUM:
      return 'Premium'
    case SUBSCRIPTION_TIERS.ELITE:
      return 'Elite'
    default:
      return 'Unknown'
  }
}

export const getTierColor = (tier) => {
  switch (tier) {
    case SUBSCRIPTION_TIERS.FREE:
      return 'gray'
    case SUBSCRIPTION_TIERS.PREMIUM:
      return 'yellow'
    case SUBSCRIPTION_TIERS.ELITE:
      return 'purple'
    default:
      return 'gray'
  }
}

// Usage tracking utilities
export const calculateUsagePercentage = (used, limit) => {
  if (!limit || limit === 'unlimited') return 0
  return Math.min((used / limit) * 100, 100)
}

export const getUsageStatus = (used, limit) => {
  const percentage = calculateUsagePercentage(used, limit)
  
  if (percentage >= 90) return 'critical'
  if (percentage >= 75) return 'warning'
  if (percentage >= 50) return 'moderate'
  return 'good'
}

export const getRemainingUsage = (used, limit) => {
  if (!limit || limit === 'unlimited') return 'unlimited'
  return Math.max(limit - used, 0)
}

// Feature comparison utilities
export const compareFeatures = (tier1, tier2) => {
  const limits1 = getSubscriptionLimits(tier1)
  const limits2 = getSubscriptionLimits(tier2)
  
  return {
    tier1Features: limits1.features,
    tier2Features: limits2.features,
    uniqueToTier1: limits1.features.filter(f => !limits2.features.includes(f)),
    uniqueToTier2: limits2.features.filter(f => !limits1.features.includes(f)),
    common: limits1.features.filter(f => limits2.features.includes(f))
  }
}

// Subscription pricing (for upgrade flows)
export const SUBSCRIPTION_PRICING = {
  [SUBSCRIPTION_TIERS.PREMIUM]: {
    monthly: 19.99,
    yearly: 199.99,
    yearlyDiscount: 17 // percentage
  },
  [SUBSCRIPTION_TIERS.ELITE]: {
    monthly: 49.99,
    yearly: 499.99,
    yearlyDiscount: 17 // percentage
  }
}

export const getSubscriptionPrice = (tier, billing = 'monthly') => {
  return SUBSCRIPTION_PRICING[tier]?.[billing] || 0
}

export const calculateYearlySavings = (tier) => {
  const pricing = SUBSCRIPTION_PRICING[tier]
  if (!pricing) return 0
  
  const monthlyTotal = pricing.monthly * 12
  const yearlySavings = monthlyTotal - pricing.yearly
  return yearlySavings
}

// Subscription validation
export const isValidTier = (tier) => {
  return Object.values(SUBSCRIPTION_TIERS).includes(tier)
}

export const isActiveSubscription = (status) => {
  return ['active', 'trialing'].includes(status)
}

export const needsUpgrade = (currentTier, requiredFeature) => {
  return !hasFeatureAccess(currentTier, requiredFeature)
}

// Feature gate messages
export const getFeatureGateMessage = (feature, userTier) => {
  const requiredTier = getMinimumTierForFeature(feature)
  
  if (!requiredTier) return null
  
  const tierName = getTierDisplayName(requiredTier)
  const featureName = getFeatureDisplayName(feature)
  
  return {
    title: `${featureName} - ${tierName} Feature`,
    message: `Unlock ${featureName.toLowerCase()} and more with ${tierName}`,
    requiredTier,
    currentTier: userTier
  }
}

export const getMinimumTierForFeature = (feature) => {
  for (const [tier, limits] of Object.entries(SUBSCRIPTION_LIMITS)) {
    if (limits.features.includes(feature)) {
      return tier
    }
  }
  return null
}

export const getFeatureDisplayName = (feature) => {
  const displayNames = {
    [FEATURES.PREDICTIONS]: 'Match Predictions',
    [FEATURES.ADVANCED_STATS]: 'Advanced Statistics',
    [FEATURES.INJURY_INSIGHTS]: 'Injury Reports',
    [FEATURES.H2H_ANALYSIS]: 'Head-to-Head Analysis',
    [FEATURES.VALUE_BETS]: 'Value Bet Analysis',
    [FEATURES.AI_PREDICTIONS]: 'AI-Powered Predictions',
    [FEATURES.HISTORICAL_TRENDS]: 'Historical Trends',
    [FEATURES.CUSTOM_ALERTS]: 'Custom Alerts',
    [FEATURES.PRIORITY_SUPPORT]: 'Priority Support',
    [FEATURES.EXPORT_DATA]: 'Data Export',
    [FEATURES.API_ACCESS]: 'API Access',
    [FEATURES.ADVANCED_FILTERING]: 'Advanced Filtering'
  }
  
  return displayNames[feature] || feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export default {
  SUBSCRIPTION_TIERS,
  FEATURES,
  SUBSCRIPTION_LIMITS,
  SUBSCRIPTION_PRICING,
  getSubscriptionLimits,
  hasFeatureAccess,
  canUpgradeFrom,
  getNextTier,
  getTierDisplayName,
  getTierColor,
  calculateUsagePercentage,
  getUsageStatus,
  getRemainingUsage,
  compareFeatures,
  getSubscriptionPrice,
  calculateYearlySavings,
  isValidTier,
  isActiveSubscription,
  needsUpgrade,
  getFeatureGateMessage,
  getMinimumTierForFeature,
  getFeatureDisplayName
}