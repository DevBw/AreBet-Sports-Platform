// ===============================================
// CONNECTION TESTING UTILITY
// Tests Supabase and API-Football connections
// ===============================================

import { supabase } from '../config/supabase';
// import { areBetService } from '../services/SupabaseServiceV2';
import apiFootball from '../services/ApiFootballService';

export class ConnectionTester {
  constructor() {
    this.results = {
      supabase: { status: 'pending', details: null, error: null },
      database: { status: 'pending', details: null, error: null },
      apiFootball: { status: 'pending', details: null, error: null },
      overall: { status: 'pending', score: 0 }
    };
  }

  async runAllTests() {
    console.log('🧪 Starting connection tests...');
    
    // Test in parallel for speed
    await Promise.allSettled([
      this.testSupabaseConnection(),
      this.testDatabaseSchema(),
      this.testApiFootballConnection()
    ]);

    this.calculateOverallScore();
    return this.results;
  }

  async testSupabaseConnection() {
    try {
      console.log('🔗 Testing Supabase connection...');
      
      // Test basic connection
      const { data: _data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      this.results.supabase = {
        status: 'success',
        details: {
          connected: true,
          url: supabase.supabaseUrl,
          hasKey: !!supabase.supabaseKey,
          timestamp: new Date().toISOString()
        },
        error: null
      };

      console.log('✅ Supabase connection successful');
    } catch (error) {
      console.error('❌ Supabase connection failed:', error);
      
      this.results.supabase = {
        status: 'error',
        details: {
          connected: false,
          url: supabase.supabaseUrl || 'Not configured',
          hasKey: false
        },
        error: error.message
      };
    }
  }

  async testDatabaseSchema() {
    try {
      console.log('📊 Testing database schema...');
      
      const tableTests = [
        { table: 'profiles', required: true },
        { table: 'leagues', required: true },
        { table: 'teams', required: true },
        { table: 'fixtures', required: true },
        { table: 'standings', required: false },
        { table: 'predictions', required: false }
      ];

      const results = {};
      
      for (const test of tableTests) {
        try {
          const { data, error } = await supabase
            .from(test.table)
            .select('*')
            .limit(1);
          
          if (error && test.required) {
            throw new Error(`Required table ${test.table} error: ${error.message}`);
          }

          results[test.table] = {
            exists: !error,
            hasData: data && data.length > 0,
            error: error?.message
          };
        } catch (err) {
          results[test.table] = {
            exists: false,
            hasData: false,
            error: err.message
          };
        }
      }

      const requiredTablesExist = tableTests
        .filter(t => t.required)
        .every(t => results[t.table].exists);

      if (!requiredTablesExist) {
        throw new Error('Some required database tables are missing or inaccessible');
      }

      this.results.database = {
        status: 'success',
        details: {
          tables: results,
          schemaVersion: 'v2.0',
          timestamp: new Date().toISOString()
        },
        error: null
      };

      console.log('✅ Database schema test successful');
    } catch (error) {
      console.error('❌ Database schema test failed:', error);
      
      this.results.database = {
        status: 'error',
        details: { tables: {} },
        error: error.message
      };
    }
  }

  async testApiFootballConnection() {
    try {
      console.log('⚽ Testing API-Football connection...');
      
      const hasApiKey = !!(process.env.REACT_APP_RAPIDAPI_KEY || process.env.REACT_APP_API_FOOTBALL_KEY);
      
      if (!hasApiKey) {
        this.results.apiFootball = {
          status: 'warning',
          details: {
            connected: false,
            mockMode: true,
            message: 'No API key configured - using mock data'
          },
          error: null
        };
        console.log('⚠️ API-Football: Using mock data (no API key)');
        return;
      }

      // Test with a simple request
      const response = await apiFootball.getTimezones();
      
      if (!response || !response.response) {
        throw new Error('Invalid API response format');
      }

      this.results.apiFootball = {
        status: 'success',
        details: {
          connected: true,
          mockMode: false,
          hasApiKey: true,
          responseTime: Date.now(),
          endpoints: ['timezones', 'fixtures', 'leagues', 'teams']
        },
        error: null
      };

      console.log('✅ API-Football connection successful');
    } catch (error) {
      console.error('❌ API-Football connection failed:', error);
      
      this.results.apiFootball = {
        status: 'error',
        details: {
          connected: false,
          mockMode: true,
          hasApiKey: !!(process.env.REACT_APP_RAPIDAPI_KEY || process.env.REACT_APP_API_FOOTBALL_KEY)
        },
        error: error.message
      };
    }
  }

  calculateOverallScore() {
    let score = 0;
    let maxScore = 0;

    // Supabase (critical) - 50 points
    maxScore += 50;
    if (this.results.supabase.status === 'success') score += 50;
    else if (this.results.supabase.status === 'warning') score += 25;

    // Database (critical) - 40 points  
    maxScore += 40;
    if (this.results.database.status === 'success') score += 40;
    else if (this.results.database.status === 'warning') score += 20;

    // API-Football (optional) - 10 points
    maxScore += 10;
    if (this.results.apiFootball.status === 'success') score += 10;
    else if (this.results.apiFootball.status === 'warning') score += 5;

    const percentage = Math.round((score / maxScore) * 100);

    this.results.overall = {
      status: percentage >= 80 ? 'success' : percentage >= 50 ? 'warning' : 'error',
      score: percentage,
      message: this.getOverallMessage(percentage),
      recommendations: this.getRecommendations()
    };
  }

  getOverallMessage(score) {
    if (score >= 90) return '🎉 All systems operational! Ready for production.';
    if (score >= 80) return '✅ Core systems working. Minor issues detected.';
    if (score >= 50) return '⚠️ Partial functionality. Some features may not work.';
    return '❌ Major issues detected. Setup required.';
  }

  getRecommendations() {
    const recommendations = [];

    if (this.results.supabase.status === 'error') {
      recommendations.push('Configure Supabase credentials in .env.local');
      recommendations.push('Verify Supabase project is active and accessible');
    }

    if (this.results.database.status === 'error') {
      recommendations.push('Run database-schema.sql in Supabase SQL Editor');
      recommendations.push('Check Row Level Security policies are enabled');
    }

    if (this.results.apiFootball.status === 'error') {
      recommendations.push('Add REACT_APP_RAPIDAPI_KEY to .env.local (optional)');
      recommendations.push('App will work with mock data if API key not provided');
    }

    if (recommendations.length === 0) {
      recommendations.push('All systems operational! 🚀');
    }

    return recommendations;
  }

  // Quick health check (lighter version)
  async quickHealthCheck() {
    try {
      const { data: profileCount } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      const { data: leagueCount } = await supabase
        .from('leagues')
        .select('count')
        .limit(1);

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {
          supabase: 'connected',
          database: profileCount !== null && leagueCount !== null ? 'ready' : 'missing_data',
          apiFootball: apiFootball.apiKey ? 'configured' : 'mock_mode'
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Export singleton instance
export const connectionTester = new ConnectionTester();
export default connectionTester;