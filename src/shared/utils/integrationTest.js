// ===============================================
// COMPREHENSIVE INTEGRATION TEST SUITE
// Tests all platform components working together
// ===============================================

import connectionTester from './connectionTest';
import apiConfigTester from './apiConfigTest';
import subscriptionTester from './subscriptionTest';
import dataSeed from './dataSeed';
import { supabase } from '../services/supabase';

export class IntegrationTestSuite {
  constructor() {
    this.results = {
      environment: { status: 'pending', details: null },
      database: { status: 'pending', details: null },
      api: { status: 'pending', details: null },
      subscriptions: { status: 'pending', details: null },
      realtime: { status: 'pending', details: null },
      performance: { status: 'pending', details: null }
    };
    this.startTime = null;
    this.endTime = null;
  }

  async runFullIntegrationTest() {
    console.log('🧪 Starting comprehensive integration test suite...');
    console.log('━'.repeat(60));
    
    this.startTime = Date.now();

    try {
      // Run tests in sequence to avoid overwhelming the system
      await this.testEnvironment();
      await this.testDatabase();
      await this.testAPI();
      await this.testSubscriptions();
      await this.testRealtime();
      await this.testPerformance();
      
      this.endTime = Date.now();
      
      console.log('━'.repeat(60));
      console.log('✅ Integration test suite completed');
      
      return this.generateReport();
    } catch (error) {
      console.error('❌ Integration test suite failed:', error);
      this.endTime = Date.now();
      return this.generateReport(error);
    }
  }

  async testEnvironment() {
    console.log('🌍 Testing environment configuration...');
    
    try {
      const env = {
        nodeEnv: process.env.NODE_ENV || 'development',
        hasSupabase: !!(process.env.REACT_APP_SUPABASE_URL && process.env.REACT_APP_SUPABASE_ANON_KEY),
        hasApiKey: !!process.env.REACT_APP_RAPIDAPI_KEY,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        timestamp: new Date().toISOString()
      };

      this.results.environment = {
        status: env.hasSupabase ? 'success' : 'warning',
        details: {
          ...env,
          recommendations: env.hasSupabase 
            ? ['Environment properly configured']
            : ['Add Supabase credentials to .env.local'],
          score: (env.hasSupabase ? 3 : 1) + (env.hasApiKey ? 1 : 0)
        }
      };
      
      console.log(`  ${env.hasSupabase ? '✅' : '⚠️'} Supabase: ${env.hasSupabase ? 'Configured' : 'Missing'}`);
      console.log(`  ${env.hasApiKey ? '✅' : '⚠️'} API Key: ${env.hasApiKey ? 'Configured' : 'Using Mock Data'}`);
    } catch (error) {
      this.results.environment = {
        status: 'error',
        details: { error: error.message }
      };
    }
  }

  async testDatabase() {
    console.log('🗄️ Testing database connectivity and schema...');
    
    try {
      const dbTest = await connectionTester.runAllTests();
      
      this.results.database = {
        status: dbTest.overall.status,
        details: {
          supabase: dbTest.details.supabase,
          schema: dbTest.details.database,
          score: dbTest.overall.score,
          recommendations: dbTest.recommendations
        }
      };
      
      console.log(`  ${dbTest.overall.status === 'success' ? '✅' : '❌'} Database: ${dbTest.overall.message}`);
    } catch (error) {
      this.results.database = {
        status: 'error',
        details: { error: error.message }
      };
    }
  }

  async testAPI() {
    console.log('⚽ Testing API-Football integration...');
    
    try {
      const apiTest = await apiConfigTester.runAllTests();
      
      this.results.api = {
        status: apiTest.overall.status,
        details: {
          configuration: apiTest.details.configuration,
          connectivity: apiTest.details.connectivity,
          dataQuality: apiTest.details.dataQuality,
          performance: apiTest.details.performance,
          score: apiTest.overall.score,
          recommendations: apiTest.recommendations
        }
      };
      
      console.log(`  ${apiTest.overall.status === 'success' ? '✅' : '⚠️'} API: ${apiTest.overall.message}`);
    } catch (error) {
      this.results.api = {
        status: 'error',
        details: { error: error.message }
      };
    }
  }

  async testSubscriptions() {
    console.log('🔐 Testing subscription system...');
    
    try {
      const subTest = await subscriptionTester.runAllTests();
      
      this.results.subscriptions = {
        status: subTest.overall.status,
        details: {
          database: subTest.details.database,
          tiers: subTest.details.tiers,
          featureGating: subTest.details.featureGating,
          policies: subTest.details.policies,
          score: subTest.overall.score,
          recommendations: subTest.recommendations,
          summary: subTest.summary
        }
      };
      
      console.log(`  ${subTest.overall.status === 'success' ? '✅' : '❌'} Subscriptions: ${subTest.overall.message}`);
    } catch (error) {
      this.results.subscriptions = {
        status: 'error',
        details: { error: error.message }
      };
    }
  }

  async testRealtime() {
    console.log('⚡ Testing real-time features...');
    
    try {
      const realtimeTest = await this.performRealtimeTest();
      
      this.results.realtime = {
        status: realtimeTest.status,
        details: realtimeTest
      };
      
      console.log(`  ${realtimeTest.status === 'success' ? '✅' : '⚠️'} Real-time: ${realtimeTest.message}`);
    } catch (error) {
      this.results.realtime = {
        status: 'error',
        details: { error: error.message }
      };
    }
  }

  async testPerformance() {
    console.log('🚀 Testing overall performance...');
    
    try {
      const perfTest = await this.performPerformanceTest();
      
      this.results.performance = {
        status: perfTest.status,
        details: perfTest
      };
      
      console.log(`  ${perfTest.status === 'success' ? '✅' : '⚠️'} Performance: ${perfTest.message}`);
    } catch (error) {
      this.results.performance = {
        status: 'error',
        details: { error: error.message }
      };
    }
  }

  async performRealtimeTest() {
    try {
      // Test if we can subscribe to real-time changes
      const testChannel = Math.random().toString(36).substring(7);
      let received = false;
      
      const subscription = supabase
        .channel(testChannel)
        .on('broadcast', { event: 'test' }, () => {
          received = true;
        })
        .subscribe();

      // Give it a moment to connect
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Send a test message
      await supabase.channel(testChannel).send({
        type: 'broadcast',
        event: 'test',
        payload: { message: 'test' }
      });

      // Wait for response
      await new Promise(resolve => setTimeout(resolve, 1000));

      subscription.unsubscribe();

      return {
        status: received ? 'success' : 'warning',
        message: received ? 'Real-time working' : 'Real-time may not be functioning',
        websocketSupported: 'WebSocket' in window,
        channelTest: received,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Real-time test failed',
        error: error.message
      };
    }
  }

  async performPerformanceTest() {
    const startTime = Date.now();
    const tests = [];

    try {
      // Test multiple concurrent operations
      tests.push(this.timeOperation('Database Query', () => 
        connectionTester.quickHealthCheck()
      ));
      
      tests.push(this.timeOperation('API Call', () => 
        apiConfigTester.testConnectivity()
      ));

      const results = await Promise.allSettled(tests);
      const endTime = Date.now();
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const totalTime = endTime - startTime;
      const averageTime = totalTime / tests.length;

      return {
        status: averageTime < 3000 && successful === tests.length ? 'success' : 'warning',
        message: `${successful}/${tests.length} operations completed in ${totalTime}ms`,
        totalOperations: tests.length,
        successfulOperations: successful,
        totalTime: `${totalTime}ms`,
        averageTime: `${averageTime.toFixed(0)}ms`,
        details: results.map((r, i) => ({
          test: `Test ${i + 1}`,
          status: r.status,
          value: r.status === 'fulfilled' ? r.value : null,
          reason: r.status === 'rejected' ? r.reason.message : null
        }))
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Performance test failed',
        error: error.message
      };
    }
  }

  async timeOperation(name, operation) {
    const start = Date.now();
    try {
      const result = await operation();
      const end = Date.now();
      return { name, time: end - start, result, success: true };
    } catch (error) {
      const end = Date.now();
      return { name, time: end - start, error: error.message, success: false };
    }
  }

  generateReport(error = null) {
    const totalTime = this.endTime - this.startTime;
    
    // Calculate overall score
    const scores = Object.values(this.results).map(result => {
      switch (result.status) {
        case 'success': return 3;
        case 'warning': return 2;
        case 'error': return 0;
        default: return 1;
      }
    });
    
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const maxScore = Object.keys(this.results).length * 3;
    const overallScore = Math.round((totalScore / maxScore) * 100);
    
    const report = {
      metadata: {
        timestamp: new Date().toISOString(),
        duration: `${totalTime}ms`,
        version: '2.0.0',
        testSuite: 'AreBet Integration Test'
      },
      overall: {
        status: overallScore >= 80 ? 'success' : overallScore >= 60 ? 'warning' : 'error',
        score: overallScore,
        message: this.getOverallMessage(overallScore),
        error: error?.message || null
      },
      results: this.results,
      summary: {
        totalTests: Object.keys(this.results).length,
        passedTests: Object.values(this.results).filter(r => r.status === 'success').length,
        warningTests: Object.values(this.results).filter(r => r.status === 'warning').length,
        failedTests: Object.values(this.results).filter(r => r.status === 'error').length,
        pendingTests: Object.values(this.results).filter(r => r.status === 'pending').length
      },
      recommendations: this.generateRecommendations(),
      nextSteps: this.generateNextSteps()
    };

    // Log summary
    console.log('');
    console.log('📊 INTEGRATION TEST REPORT');
    console.log('━'.repeat(60));
    console.log(`Overall Score: ${overallScore}% (${report.summary.passedTests}/${report.summary.totalTests} passed)`);
    console.log(`Status: ${report.overall.message}`);
    console.log(`Duration: ${totalTime}ms`);
    console.log('');
    
    if (report.recommendations.length > 0) {
      console.log('📋 Recommendations:');
      report.recommendations.slice(0, 3).forEach(rec => console.log(`  • ${rec}`));
      if (report.recommendations.length > 3) {
        console.log(`  ... and ${report.recommendations.length - 3} more`);
      }
    }

    return report;
  }

  getOverallMessage(score) {
    if (score >= 90) return '🎉 Platform is production-ready! All systems optimal.';
    if (score >= 80) return '✅ Platform is working well with minor optimizations needed.';
    if (score >= 60) return '⚠️ Platform is functional but requires some attention.';
    return '❌ Platform has significant issues that need to be addressed.';
  }

  generateRecommendations() {
    const recommendations = [];
    
    Object.entries(this.results).forEach(([testName, result]) => {
      if (result.status === 'error') {
        recommendations.push(`Fix ${testName} issues - see detailed results for specifics`);
      } else if (result.status === 'warning') {
        recommendations.push(`Optimize ${testName} performance and configuration`);
      }
      
      // Add specific recommendations from test details
      if (result.details?.recommendations) {
        recommendations.push(...result.details.recommendations.slice(0, 2));
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('🚀 All systems are working perfectly!');
      recommendations.push('Consider adding monitoring and analytics for production');
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  generateNextSteps() {
    const overallScore = this.calculateOverallScore();
    
    if (overallScore >= 90) {
      return [
        '🚀 Deploy to production environment',
        '📊 Set up monitoring and analytics',
        '🔄 Implement CI/CD pipeline',
        '📱 Consider mobile app development'
      ];
    } else if (overallScore >= 80) {
      return [
        '🔧 Address minor configuration issues',
        '🧪 Run additional load testing',
        '📋 Complete documentation review',
        '🚀 Prepare for staging deployment'
      ];
    } else if (overallScore >= 60) {
      return [
        '⚠️ Fix identified configuration issues',
        '🗄️ Ensure database is properly set up',
        '🔑 Configure missing API keys',
        '🧪 Re-run tests after fixes'
      ];
    } else {
      return [
        '❌ Follow setup guide to configure platform',
        '🗄️ Set up Supabase project and run schema',
        '📝 Create .env.local with proper credentials',
        '📖 Review SUPABASE_SETUP_GUIDE.md'
      ];
    }
  }

  calculateOverallScore() {
    const scores = Object.values(this.results).map(result => {
      switch (result.status) {
        case 'success': return 3;
        case 'warning': return 2;
        case 'error': return 0;
        default: return 1;
      }
    });
    
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const maxScore = Object.keys(this.results).length * 3;
    return Math.round((totalScore / maxScore) * 100);
  }
}

export default new IntegrationTestSuite();