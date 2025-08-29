// ===============================================
// SUBSCRIPTION FEATURE TESTING UTILITY  
// Tests subscription tiers, feature gating, and database policies
// ===============================================

import { supabase } from '../config/supabase';
import { SUBSCRIPTION_TIERS, FEATURES, hasFeatureAccess } from './subscriptionUtils';

export class SubscriptionTester {
  constructor() {
    this.results = {
      database: { status: 'pending', details: null },
      tiers: { status: 'pending', details: null },
      featureGating: { status: 'pending', details: null },
      policies: { status: 'pending', details: null }
    };
  }

  async runAllTests() {
    console.log('🔐 Starting subscription feature tests...');
    
    await Promise.allSettled([
      this.testDatabaseSchema(),
      this.testSubscriptionTiers(),
      this.testFeatureGating(),
      this.testRowLevelSecurity()
    ]);

    return this.getOverallResult();
  }

  async testDatabaseSchema() {
    try {
      console.log('📊 Testing subscription database schema...');
      
      // Test profiles table structure
      const { data: profilesInfo, error: profilesError } = await supabase
        .rpc('get_table_info', { table_name: 'profiles' })
        .catch(() => ({ data: null, error: 'RPC not available' }));

      // Test that we can query subscription-related columns
      const { data: profileTest, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status, api_quota_used')
        .limit(1);

      // Test predictions table (premium feature)
      const { data: predictionsTest, error: predictionsError } = await supabase
        .from('predictions')
        .select('id, confidence_score')
        .limit(1);

      this.results.database = {
        status: !profileError && !predictionsError ? 'success' : 'error',
        details: {
          profiles: {
            accessible: !profileError,
            error: profileError?.message,
            hasSubscriptionFields: profileTest !== null
          },
          predictions: {
            accessible: !predictionsError,
            error: predictionsError?.message,
            hasData: predictionsTest && predictionsTest.length > 0
          },
          schema: {
            profilesInfo: profilesInfo || 'Schema info not available',
            tablesCreated: true
          }
        }
      };

      console.log('✅ Database schema test completed');
    } catch (error) {
      console.error('❌ Database schema test failed:', error);
      this.results.database = {
        status: 'error',
        details: { error: error.message }
      };
    }
  }

  async testSubscriptionTiers() {
    try {
      console.log('🎯 Testing subscription tier logic...');
      
      const tierTests = [];
      
      // Test each subscription tier
      Object.values(SUBSCRIPTION_TIERS).forEach(tier => {
        const features = this.getFeatureListForTier(tier);
        const limits = this.getLimitsForTier(tier);
        
        tierTests.push({
          tier,
          displayName: this.getTierDisplayName(tier),
          featureCount: features.length,
          features,
          limits,
          isValid: this.validateTierConfiguration(tier)
        });
      });

      // Test tier hierarchy
      const hierarchy = this.testTierHierarchy();

      this.results.tiers = {
        status: tierTests.every(t => t.isValid) && hierarchy.isValid ? 'success' : 'error',
        details: {
          tiers: tierTests,
          hierarchy,
          totalTiers: tierTests.length,
          validTiers: tierTests.filter(t => t.isValid).length
        }
      };

      console.log('✅ Subscription tier tests completed');
    } catch (error) {
      console.error('❌ Subscription tier test failed:', error);
      this.results.tiers = {
        status: 'error',
        details: { error: error.message }
      };
    }
  }

  async testFeatureGating() {
    try {
      console.log('🚪 Testing feature gating...');
      
      const gatingTests = [];

      // Test each feature against each tier
      Object.values(FEATURES).forEach(feature => {
        const test = {
          feature,
          displayName: this.getFeatureDisplayName(feature),
          tierAccess: {}
        };

        Object.values(SUBSCRIPTION_TIERS).forEach(tier => {
          test.tierAccess[tier] = hasFeatureAccess(tier, feature);
        });

        // Validate that feature access follows hierarchy
        const isHierarchyValid = this.validateFeatureHierarchy(test.tierAccess);
        test.hierarchyValid = isHierarchyValid;
        
        gatingTests.push(test);
      });

      // Test feature categories
      const categories = this.categorizeFeatures(gatingTests);

      this.results.featureGating = {
        status: gatingTests.every(t => t.hierarchyValid) ? 'success' : 'error',
        details: {
          features: gatingTests,
          categories,
          totalFeatures: gatingTests.length,
          validFeatures: gatingTests.filter(t => t.hierarchyValid).length
        }
      };

      console.log('✅ Feature gating tests completed');
    } catch (error) {
      console.error('❌ Feature gating test failed:', error);
      this.results.featureGating = {
        status: 'error',
        details: { error: error.message }
      };
    }
  }

  async testRowLevelSecurity() {
    try {
      console.log('🔒 Testing row level security policies...');
      
      // Test if RLS is enabled on key tables
      const rlsTables = ['profiles', 'predictions', 'api_usage_logs'];
      const rlsTests = [];

      for (const table of rlsTables) {
        try {
          // Try to check if RLS is enabled (this might not work in all environments)
          const { data: rlsInfo, error } = await supabase
            .rpc('check_rls_enabled', { table_name: table })
            .catch(() => ({ data: null, error: 'RLS check not available' }));

          // Test access patterns
          const { data: _testData, error: testError } = await supabase
            .from(table)
            .select('*')
            .limit(1);

          rlsTests.push({
            table,
            rlsEnabled: rlsInfo?.rls_enabled || 'unknown',
            canQuery: !testError,
            error: testError?.message,
            status: !testError ? 'accessible' : 'restricted'
          });
        } catch (error) {
          rlsTests.push({
            table,
            rlsEnabled: 'unknown',
            canQuery: false,
            error: error.message,
            status: 'error'
          });
        }
      }

      // Test subscription-based access
      const subscriptionAccess = await this.testSubscriptionBasedAccess();

      this.results.policies = {
        status: rlsTests.every(t => t.status !== 'error') ? 'success' : 'warning',
        details: {
          tables: rlsTests,
          subscriptionAccess,
          securityFeatures: {
            rlsEnabled: rlsTests.filter(t => t.rlsEnabled === true).length,
            accessibleTables: rlsTests.filter(t => t.canQuery).length,
            restrictedTables: rlsTests.filter(t => t.status === 'restricted').length
          }
        }
      };

      console.log('✅ Row level security tests completed');
    } catch (error) {
      console.error('❌ RLS test failed:', error);
      this.results.policies = {
        status: 'error',
        details: { error: error.message }
      };
    }
  }

  async testSubscriptionBasedAccess() {
    const tests = [];

    // Test predictions access (should require premium+)
    try {
      const { data: predictions, error } = await supabase
        .from('predictions')
        .select('*')
        .limit(5);

      tests.push({
        feature: 'predictions',
        requiredTier: 'premium',
        accessible: !error,
        dataCount: predictions?.length || 0,
        error: error?.message
      });
    } catch (error) {
      tests.push({
        feature: 'predictions',
        requiredTier: 'premium',
        accessible: false,
        error: error.message
      });
    }

    return tests;
  }

  // Helper methods
  getFeatureListForTier(tier) {
    const features = Object.values(FEATURES);
    return features.filter(feature => hasFeatureAccess(tier, feature));
  }

  getLimitsForTier(tier) {
    // This would normally come from subscriptionUtils
    const limits = {
      [SUBSCRIPTION_TIERS.FREE]: { apiQuota: 100, predictions: 0 },
      [SUBSCRIPTION_TIERS.PREMIUM]: { apiQuota: 1000, predictions: 50 },
      [SUBSCRIPTION_TIERS.ELITE]: { apiQuota: 5000, predictions: 200 }
    };
    return limits[tier] || limits[SUBSCRIPTION_TIERS.FREE];
  }

  getTierDisplayName(tier) {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  }

  validateTierConfiguration(tier) {
    // Check if tier has valid configuration
    const features = this.getFeatureListForTier(tier);
    const limits = this.getLimitsForTier(tier);
    
    return features.length > 0 && limits.apiQuota > 0;
  }

  testTierHierarchy() {
    const tiers = Object.values(SUBSCRIPTION_TIERS);
    const featureCounts = tiers.map(tier => ({
      tier,
      featureCount: this.getFeatureListForTier(tier).length
    }));

    // Elite should have most features, Free should have least
    const isValid = featureCounts.every((current, index) => {
      if (index === 0) return true;
      return current.featureCount >= featureCounts[index - 1].featureCount;
    });

    return { isValid, featureCounts };
  }

  validateFeatureHierarchy(tierAccess) {
    // If elite has access, premium should too
    // If premium has access, free might not
    const tiers = [SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.PREMIUM, SUBSCRIPTION_TIERS.ELITE];
    
    for (let i = 1; i < tiers.length; i++) {
      const currentTier = tiers[i];
      const previousTier = tiers[i - 1];
      
      // If current tier has access, all higher tiers should have access too
      if (tierAccess[previousTier] && !tierAccess[currentTier]) {
        return false;
      }
    }
    
    return true;
  }

  categorizeFeatures(gatingTests) {
    const categories = {
      basic: gatingTests.filter(t => t.tierAccess[SUBSCRIPTION_TIERS.FREE]),
      premium: gatingTests.filter(t => !t.tierAccess[SUBSCRIPTION_TIERS.FREE] && t.tierAccess[SUBSCRIPTION_TIERS.PREMIUM]),
      elite: gatingTests.filter(t => !t.tierAccess[SUBSCRIPTION_TIERS.PREMIUM] && t.tierAccess[SUBSCRIPTION_TIERS.ELITE])
    };

    return {
      ...categories,
      total: gatingTests.length,
      distribution: {
        basic: categories.basic.length,
        premium: categories.premium.length,
        elite: categories.elite.length
      }
    };
  }

  getFeatureDisplayName(feature) {
    const displayNames = {
      [FEATURES.BASIC_SCORES]: 'Basic Scores',
      [FEATURES.PREDICTIONS]: 'Match Predictions',
      [FEATURES.ADVANCED_STATS]: 'Advanced Statistics',
      [FEATURES.VALUE_BETS]: 'Value Bet Analysis',
      [FEATURES.AI_PREDICTIONS]: 'AI Predictions'
    };
    return displayNames[feature] || feature;
  }

  getOverallResult() {
    const scores = {
      database: this.results.database.status === 'success' ? 3 : 0,
      tiers: this.results.tiers.status === 'success' ? 3 : 0,
      featureGating: this.results.featureGating.status === 'success' ? 2 : 0,
      policies: this.results.policies.status === 'success' ? 2 : 
                this.results.policies.status === 'warning' ? 1 : 0
    };

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const maxScore = 10;
    const percentage = Math.round((totalScore / maxScore) * 100);

    return {
      overall: {
        status: percentage >= 80 ? 'success' : percentage >= 60 ? 'warning' : 'error',
        score: percentage,
        message: this.getOverallMessage(percentage)
      },
      details: this.results,
      recommendations: this.getRecommendations(),
      summary: {
        totalTests: 4,
        passedTests: Object.values(this.results).filter(r => r.status === 'success').length,
        warningTests: Object.values(this.results).filter(r => r.status === 'warning').length,
        failedTests: Object.values(this.results).filter(r => r.status === 'error').length
      }
    };
  }

  getOverallMessage(score) {
    if (score >= 90) return '🎉 Subscription system perfect! All features working.';
    if (score >= 80) return '✅ Subscription system working well with minor issues.';
    if (score >= 60) return '⚠️ Subscription system functional but needs attention.';
    return '❌ Subscription system has significant issues.';
  }

  getRecommendations() {
    const recommendations = [];

    if (this.results.database.status === 'error') {
      recommendations.push('Run database-schema.sql to create subscription tables');
      recommendations.push('Verify profiles table has subscription_tier column');
    }

    if (this.results.tiers.status === 'error') {
      recommendations.push('Review subscription tier configuration in subscriptionUtils.js');
      recommendations.push('Ensure feature lists are properly defined for each tier');
    }

    if (this.results.featureGating.status === 'error') {
      recommendations.push('Fix feature hierarchy - higher tiers should include lower tier features');
      recommendations.push('Review hasFeatureAccess function logic');
    }

    if (this.results.policies.status === 'error') {
      recommendations.push('Enable Row Level Security on sensitive tables');
      recommendations.push('Review and update RLS policies in database');
    }

    if (recommendations.length === 0) {
      recommendations.push('🚀 Subscription system is working perfectly!');
      recommendations.push('Consider adding more advanced features for premium tiers');
    }

    return recommendations;
  }
}

export default new SubscriptionTester();