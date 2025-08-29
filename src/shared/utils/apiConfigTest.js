// ===============================================
// API CONFIGURATION TESTING UTILITY
// Tests API-Football configuration and connectivity
// ===============================================

import apiFootball from '../services/ApiFootballIntegration';

export class ApiConfigTester {
  constructor() {
    this.results = {
      configuration: { status: 'pending', details: null },
      connectivity: { status: 'pending', details: null },
      dataQuality: { status: 'pending', details: null },
      performance: { status: 'pending', details: null }
    };
  }

  async runAllTests() {
    console.log('🔧 Starting API configuration tests...');
    
    await Promise.allSettled([
      this.testConfiguration(),
      this.testConnectivity(),
      this.testDataQuality(),
      this.testPerformance()
    ]);

    return this.getOverallResult();
  }

  async testConfiguration() {
    try {
      console.log('⚙️ Testing API configuration...');
      
      const hasApiKey = !!process.env.REACT_APP_RAPIDAPI_KEY;
      const baseUrl = 'https://api-football-v1.p.rapidapi.com/v3';
      const isValid = baseUrl.includes('api-football');

      this.results.configuration = {
        status: hasApiKey ? 'success' : 'warning',
        details: {
          hasApiKey,
          baseUrl,
          isValid,
          mode: hasApiKey ? 'Live API' : 'Mock Data',
          recommendation: hasApiKey 
            ? 'API configured correctly'
            : 'Add REACT_APP_RAPIDAPI_KEY to .env.local for real data'
        }
      };

      console.log(`${hasApiKey ? '✅' : '⚠️'} Configuration: ${hasApiKey ? 'Live API' : 'Mock Mode'}`);
    } catch (error) {
      this.results.configuration = {
        status: 'error',
        details: { error: error.message }
      };
    }
  }

  async testConnectivity() {
    try {
      console.log('🌐 Testing API connectivity...');
      
      const startTime = Date.now();
      
      // Test with a simple request
      const response = await apiFootball.getLeagues({ country: 'England' });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const isConnected = response && (response.response || response.get === 'mock');
      const dataSource = response.get === 'mock' ? 'Mock Data' : 'Live API';

      this.results.connectivity = {
        status: isConnected ? 'success' : 'error',
        details: {
          connected: isConnected,
          responseTime: `${responseTime}ms`,
          dataSource,
          responseSize: response.response ? response.response.length : 0,
          hasData: !!(response.response && response.response.length > 0)
        }
      };

      console.log(`✅ Connectivity: ${dataSource} (${responseTime}ms)`);
    } catch (error) {
      console.error('❌ Connectivity test failed:', error);
      this.results.connectivity = {
        status: 'error',
        details: { error: error.message }
      };
    }
  }

  async testDataQuality() {
    try {
      console.log('📊 Testing data quality...');
      
      // Test fixtures data
      const fixtures = await apiFootball.getFixturesByDate();
      const standings = await apiFootball.getStandings(39); // Premier League
      
      const fixtureQuality = this.analyzeFixtureQuality(fixtures.response || []);
      const standingQuality = this.analyzeStandingQuality(standings.response || []);

      this.results.dataQuality = {
        status: (fixtureQuality.score + standingQuality.score) > 14 ? 'success' : 'warning',
        details: {
          fixtures: fixtureQuality,
          standings: standingQuality,
          overallScore: fixtureQuality.score + standingQuality.score,
          maxScore: 20
        }
      };

      console.log('✅ Data quality tested');
    } catch (error) {
      console.error('❌ Data quality test failed:', error);
      this.results.dataQuality = {
        status: 'error',
        details: { error: error.message }
      };
    }
  }

  async testPerformance() {
    try {
      console.log('⚡ Testing API performance...');
      
      const tests = [];
      const startTime = Date.now();

      // Run multiple concurrent requests
      tests.push(apiFootball.getFixturesByDate());
      tests.push(apiFootball.getLiveFixtures());
      tests.push(apiFootball.getStandings(39));

      const results = await Promise.allSettled(tests);
      const endTime = Date.now();
      
      const totalTime = endTime - startTime;
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const averageTime = totalTime / tests.length;

      this.results.performance = {
        status: averageTime < 2000 && successCount === tests.length ? 'success' : 'warning',
        details: {
          totalRequests: tests.length,
          successfulRequests: successCount,
          totalTime: `${totalTime}ms`,
          averageTime: `${averageTime.toFixed(0)}ms`,
          cacheStats: apiFootball.getStats()
        }
      };

      console.log(`✅ Performance: ${successCount}/${tests.length} requests (${totalTime}ms)`);
    } catch (error) {
      console.error('❌ Performance test failed:', error);
      this.results.performance = {
        status: 'error',
        details: { error: error.message }
      };
    }
  }

  analyzeFixtureQuality(fixtures) {
    let score = 0;
    const analysis = {
      total: fixtures.length,
      hasTeams: 0,
      hasVenues: 0,
      hasStatus: 0,
      hasGoals: 0
    };

    fixtures.forEach(fixture => {
      if (fixture.teams?.home?.name && fixture.teams?.away?.name) {
        analysis.hasTeams++;
        score += 1;
      }
      if (fixture.fixture?.venue?.name) {
        analysis.hasVenues++;
        score += 1;
      }
      if (fixture.fixture?.status?.short) {
        analysis.hasStatus++;
        score += 1;
      }
      if (fixture.goals?.home !== null || fixture.goals?.away !== null) {
        analysis.hasGoals++;
        score += 1;
      }
    });

    return {
      score: Math.min(score, 10), // Max 10 points
      analysis,
      quality: score > 8 ? 'high' : score > 5 ? 'medium' : 'low'
    };
  }

  analyzeStandingQuality(standings) {
    let score = 0;
    const analysis = {
      total: standings.length,
      hasTeams: 0,
      hasStats: 0
    };

    standings.forEach(standing => {
      if (standing.league?.standings?.[0]) {
        const teams = standing.league.standings[0];
        analysis.hasTeams += teams.length;
        
        teams.forEach(team => {
          if (team.team?.name && team.points !== undefined) {
            score += 1;
          }
        });
      }
    });

    return {
      score: Math.min(score, 10), // Max 10 points
      analysis,
      quality: score > 8 ? 'high' : score > 5 ? 'medium' : 'low'
    };
  }

  getOverallResult() {
    const scores = {
      configuration: this.results.configuration.status === 'success' ? 3 : 
                   this.results.configuration.status === 'warning' ? 2 : 0,
      connectivity: this.results.connectivity.status === 'success' ? 3 : 0,
      dataQuality: this.results.dataQuality.status === 'success' ? 2 : 
                  this.results.dataQuality.status === 'warning' ? 1 : 0,
      performance: this.results.performance.status === 'success' ? 2 : 
                  this.results.performance.status === 'warning' ? 1 : 0
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
      recommendations: this.getRecommendations()
    };
  }

  getOverallMessage(score) {
    if (score >= 90) return '🎉 API integration excellent! All systems optimal.';
    if (score >= 80) return '✅ API integration working well. Minor optimizations possible.';
    if (score >= 60) return '⚠️ API integration functional but could be improved.';
    return '❌ API integration needs attention.';
  }

  getRecommendations() {
    const recommendations = [];

    if (this.results.configuration.status === 'warning') {
      recommendations.push('Add REACT_APP_RAPIDAPI_KEY to .env.local for real sports data');
      recommendations.push('Subscribe to API-Football on RapidAPI for live data access');
    }

    if (this.results.connectivity.status === 'error') {
      recommendations.push('Check internet connection and API endpoint accessibility');
      recommendations.push('Verify API key is valid and not expired');
    }

    if (this.results.dataQuality.status === 'warning') {
      recommendations.push('Review API response structure and data completeness');
      recommendations.push('Consider implementing data validation and cleanup');
    }

    if (this.results.performance.status === 'warning') {
      recommendations.push('Implement request batching for better performance');
      recommendations.push('Increase cache duration for frequently accessed data');
    }

    if (recommendations.length === 0) {
      recommendations.push('🚀 API integration is working perfectly!');
      recommendations.push('Consider monitoring API usage to optimize quota consumption');
    }

    return recommendations;
  }
}

export default new ApiConfigTester();