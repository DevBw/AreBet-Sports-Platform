// ===============================================
// MODERN MATCH DETAIL COMPONENT
// Enhanced match detail with premium predictions and analytics
// ===============================================

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { areBetService } from '../../shared/services/SupabaseServiceV2';
import { 
  Header,
  Card, 
  Button, 
  LoadingSpinner,
  PremiumGate,
  PremiumBadge,
  LiveMatchAlerts,
  BackgroundWrapper
} from '../../shared/components';
import { 
  TeamFormChart, 
  AdvancedTeamStats, 
  PerformanceTrends, 
  PredictionChart 
} from '../../shared/components/AdvancedCharts';

const ModernMatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasFeature, isPremium } = useAuth();
  
  const [match, setMatch] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const loadMatchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load match data
      const matchResponse = await areBetService.getFixtures({ id: parseInt(id) });
      
      if (matchResponse?.response?.[0]) {
        setMatch(matchResponse.response[0]);
        
        // Load predictions for premium users
        if (hasFeature('predictions')) {
          try {
            const predictionResponse = await areBetService.getPredictions(parseInt(id));
            if (predictionResponse?.response?.[0]) {
              setPredictions(predictionResponse.response[0]);
            }
          } catch (predError) {
            console.log('Predictions not available for this match');
          }
        }
      } else {
        setError('Match not found');
      }
    } catch (err) {
      console.error('Error loading match:', err);
      setError('Failed to load match details');
    } finally {
      setLoading(false);
    }
  }, [id, hasFeature]);

  useEffect(() => {
    loadMatchData();
  }, [loadMatchData]);

  const getStatusColor = (status) => {
    const colors = {
      'NS': 'bg-gray-100 text-gray-700',
      '1H': 'bg-green-100 text-green-700',
      '2H': 'bg-green-100 text-green-700',
      'HT': 'bg-yellow-100 text-yellow-700',
      'FT': 'bg-blue-100 text-blue-700',
      'LIVE': 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const formatMatchTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const getPredictionInsight = () => {
    if (!predictions?.predictions) return null;
    
    const { percent } = predictions.predictions;
    const homePercent = parseFloat(percent.home.replace('%', ''));
    const drawPercent = parseFloat(percent.draw.replace('%', ''));
    const awayPercent = parseFloat(percent.away.replace('%', ''));
    
    const maxPercent = Math.max(homePercent, drawPercent, awayPercent);
    let winner = 'Draw';
    if (maxPercent === homePercent) winner = 'Home';
    if (maxPercent === awayPercent) winner = 'Away';
    
    const confidence = maxPercent > 60 ? 'High' : maxPercent > 40 ? 'Medium' : 'Low';
    
    return { winner, confidence, maxPercent };
  };

  if (loading) {
    return (
      <BackgroundWrapper>
        <Header />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="xl" />
          <span className="ml-4 text-lg font-medium text-gray-600">Loading match details...</span>
        </div>
      </BackgroundWrapper>
    );
  }

  if (error || !match) {
    return (
      <BackgroundWrapper>
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-6">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Match Not Found'}</h1>
          <Button variant="primary" onClick={() => navigate('/')}>
            Back to Dashboard
          </Button>
        </div>
      </BackgroundWrapper>
    );
  }

  const matchTime = formatMatchTime(match.fixture.date);
  const isLive = ['1H', '2H', 'HT', 'LIVE'].includes(match.fixture.status.short);
  const insight = getPredictionInsight();

  return (
    <BackgroundWrapper>
      <Header />
      
      <main className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        {/* Compact Back Button */}
        <div className="mb-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-gray-300 hover:text-yellow-400 text-sm"
          >
            ← Back to Dashboard
          </Button>
        </div>

        {/* Compact Match Header */}
        <Card className="p-4 mb-4 bg-gray-900/50 border-gray-600">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <img
                src={match.league?.logo || '/api/placeholder/32/32'}
                alt={match.league?.name}
                className="w-8 h-8 object-cover rounded"
                onError={(e) => { e.target.src = '/api/placeholder/32/32' }}
              />
              <div>
                <h1 className="text-sm font-medium text-gray-600">{match.league?.name}</h1>
                <p className="text-xs text-gray-500">{match.league?.round}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(match.fixture.status.short)}`}>
                {isLive && <span className="animate-pulse mr-1">🔴</span>}
                {match.fixture.status.short === 'NS' ? 'Not Started' : 
                 isLive ? `${match.fixture.status.elapsed}'` : 
                 match.fixture.status.short}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {matchTime.date}
              </div>
              <div className="text-sm text-gray-500">
                {matchTime.time}
              </div>
            </div>
          </div>

          {/* Teams & Score */}
          <div className="grid grid-cols-3 items-center gap-8 mb-8">
            {/* Home Team */}
            <div className="text-center">
              <img
                src={match.teams.home?.logo || '/api/placeholder/64/64'}
                alt={match.teams.home?.name}
                className="w-16 h-16 mx-auto mb-3 object-cover rounded"
                onError={(e) => { e.target.src = '/api/placeholder/64/64' }}
              />
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                {match.teams.home?.name}
              </h2>
              <div className="text-sm text-gray-600">Home</div>
            </div>

            {/* Score */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {match.goals?.home !== null ? match.goals.home : '-'} 
                <span className="text-gray-400 mx-2">:</span>
                {match.goals?.away !== null ? match.goals.away : '-'}
              </div>
              {match.fixture.status.short === 'NS' && (
                <div className="text-lg font-medium text-indigo-600">
                  {matchTime.time}
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="text-center">
              <img
                src={match.teams.away?.logo || '/api/placeholder/64/64'}
                alt={match.teams.away?.name}
                className="w-16 h-16 mx-auto mb-3 object-cover rounded"
                onError={(e) => { e.target.src = '/api/placeholder/64/64' }}
              />
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                {match.teams.away?.name}
              </h2>
              <div className="text-sm text-gray-600">Away</div>
            </div>
          </div>

          {/* AI Prediction Highlight */}
          {isPremium && insight && (
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-lg p-4 border border-indigo-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🎯</span>
                  <span className="font-semibold text-indigo-700">AI Prediction</span>
                  <PremiumBadge tier="pro" />
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-indigo-700">{insight.winner} Win</div>
                  <div className="text-sm text-indigo-600">{insight.confidence} Confidence ({insight.maxPercent}%)</div>
                </div>
              </div>
            </div>
          )}

          {/* Live Match Alerts */}
          {isLive && (
            <div className="mt-4">
              <LiveMatchAlerts matchId={match.fixture.id} />
            </div>
          )}
        </Card>

        {/* Tabs Navigation */}
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'overview', label: 'Overview', available: true },
            { id: 'predictions', label: 'Predictions', available: hasFeature('predictions'), premium: true },
            { id: 'analytics', label: 'Analytics', available: hasFeature('advanced_stats'), premium: true },
            { id: 'h2h', label: 'Head to Head', available: hasFeature('predictions'), premium: true }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => tab.available && setActiveTab(tab.id)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-300 relative
                ${activeTab === tab.id 
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg' 
                  : tab.available 
                    ? 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {tab.label}
              {tab.premium && !tab.available && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Match Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Referee:</span>
                    <span className="font-medium">{match.fixture.referee || 'TBA'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Venue:</span>
                    <span className="font-medium">{match.fixture.venue?.name || 'TBA'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">City:</span>
                    <span className="font-medium">{match.fixture.venue?.city || 'TBA'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium">{match.fixture.status.long}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">⚽</div>
                  <p className="text-gray-600">
                    {isLive ? 'Live match statistics coming soon!' : 
                     match.fixture.status.short === 'NS' ? 'Match hasn\'t started yet' :
                     'Match statistics will appear here'}
                  </p>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'predictions' && (
            <PremiumGate
              feature="predictions"
              title="AI-Powered Match Predictions"
              description="Get detailed predictions with confidence scores and betting insights"
            >
              {predictions && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Win Probabilities</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>{match.teams.home?.name}</span>
                          <span className="font-bold">{predictions.predictions.percent.home}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: predictions.predictions.percent.home }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Draw</span>
                          <span className="font-bold">{predictions.predictions.percent.draw}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full" 
                            style={{ width: predictions.predictions.percent.draw }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>{match.teams.away?.name}</span>
                          <span className="font-bold">{predictions.predictions.percent.away}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ width: predictions.predictions.percent.away }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">AI Analysis</h3>
                    <div className="space-y-4">
                      <div>
                        <span className="text-gray-600">Predicted Score:</span>
                        <div className="text-2xl font-bold text-indigo-600">
                          {predictions.predictions.goals.home} - {predictions.predictions.goals.away}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Advice:</span>
                        <p className="font-medium mt-1">{predictions.predictions.advice}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Winner Comment:</span>
                        <p className="font-medium mt-1">{predictions.predictions.winner.comment}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </PremiumGate>
          )}

          {activeTab === 'analytics' && (
            <PremiumGate
              feature="advanced_stats"
              title="Advanced Match Analytics"
              description="Deep statistical analysis and team performance metrics"
              requiredTier="elite"
            >
              <div className="space-y-6">
                <TeamFormChart 
                  homeTeam={match.teams.home?.name} 
                  awayTeam={match.teams.away?.name} 
                />
                
                <AdvancedTeamStats 
                  homeTeam={match.teams.home?.name} 
                  awayTeam={match.teams.away?.name} 
                />
                
                <div className="grid md:grid-cols-2 gap-6">
                  <PerformanceTrends teamName={match.teams.home?.name} />
                  <PerformanceTrends teamName={match.teams.away?.name} />
                </div>
                
                {predictions && (
                  <PredictionChart prediction={predictions.predictions?.percent} />
                )}
              </div>
            </PremiumGate>
          )}

          {activeTab === 'h2h' && (
            <PremiumGate
              feature="predictions"
              title="Head-to-Head Analysis"
              description="Historical matchup data and trends between these teams"
            >
              <Card className="p-6 text-center">
                <div className="text-4xl mb-4">🥊</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Head-to-Head</h3>
                <p className="text-gray-600">
                  Historical matchup analysis and team rivalry insights coming soon!
                </p>
              </Card>
            </PremiumGate>
          )}
        </div>
      </main>
    </BackgroundWrapper>
  );
};

export default ModernMatchDetail;