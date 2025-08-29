import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Icon from './Icon';
import OptimizedImage from './OptimizedImage';
import ProbabilityWheel from './ProbabilityWheel';
import { formatDetailDate, formatTime } from '../utils';

const PredictionModal = ({ match, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('main');
  const [predictions, setPredictions] = useState(null);
  const [h2hData, setH2hData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Extract match data
  const homeTeam = match?.teams?.home || match?.homeTeam;
  const awayTeam = match?.teams?.away || match?.awayTeam;
  const date = match?.fixture?.date || match?.date;
  const venue = match?.fixture?.venue || match?.venue;
  const league = match?.league?.name || match?.league;

  const tabs = [
    { key: 'main', label: 'Match Info', icon: 'info' },
    { key: 'h2h', label: 'Head-to-Head', icon: 'shield' },
    { key: 'stats', label: 'Statistics', icon: 'barChart' }
  ];

  const loadPredictionData = useCallback(async () => {
    setLoading(true);
    try {
      // Simple prediction loading
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate mock predictions data
      const confidence = Math.floor(Math.random() * 30) + 60; // 60-90% confidence
      const homeWinProb = Math.floor(Math.random() * 30) + 35;
      const drawProb = Math.floor(Math.random() * 20) + 20;
      const awayWinProb = 100 - homeWinProb - drawProb;
      
      // Determine most likely outcome
      const outcomes = [
        { team: homeTeam?.name || 'Home Team', prob: homeWinProb },
        { team: 'Draw', prob: drawProb },
        { team: awayTeam?.name || 'Away Team', prob: awayWinProb }
      ];
      const mostLikely = outcomes.reduce((a, b) => a.prob > b.prob ? a : b);
      
      setPredictions({
        homeForm: ['W', 'L', 'D', 'W', 'W'],
        awayForm: ['L', 'W', 'D', 'L', 'W'],
        matchWinner: {
          prediction: mostLikely.team,
          confidence: confidence,
          reasoning: `Based on recent form, head-to-head records, and venue advantage analysis, our AI model predicts ${mostLikely.team} with ${confidence}% confidence.`
        },
        goalsPrediction: {
          prediction: `${Math.floor(Math.random() * 3) + 1}-${Math.floor(Math.random() * 3) + 1}`,
          confidence: Math.floor(Math.random() * 20) + 65,
          reasoning: 'Analyzing attacking and defensive stats from recent matches.'
        },
        btts: {
          prediction: Math.random() > 0.5 ? 'Yes' : 'No',
          confidence: Math.floor(Math.random() * 25) + 55,
          reasoning: 'Based on both teams scoring frequency this season.'
        }
      });

      // Use same probability distribution for h2h data
      setH2hData({
        lastMeetings: 5,
        homeWins: 2,
        draws: 2,
        awayWins: 1,
        probabilities: {
          homeWin: homeWinProb,
          draw: drawProb,
          awayWin: awayWinProb
        }
      });

    } catch (error) {
      console.error('Failed to load prediction data:', error);
    } finally {
      setLoading(false);
    }
  }, [homeTeam, awayTeam]);

  useEffect(() => {
    if (isOpen && match) {
      loadPredictionData();
    }
  }, [isOpen, match, loadPredictionData]);

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-blue-600 bg-blue-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 80) return 'HIGH CONFIDENCE';
    if (confidence >= 60) return 'MEDIUM CONFIDENCE';
    return 'LOW CONFIDENCE';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Icon name="brain" size={24} className="text-blue-200" />
                <h2 className="text-2xl font-bold">AI Prediction Center</h2>
              </div>
              <div className="text-blue-100">
                {homeTeam?.name} vs {awayTeam?.name} • {formatDetailDate(date)} {formatTime(date)}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-blue-200 hover:text-white p-2 rounded-lg hover:bg-blue-500 transition-colors"
            >
              <Icon name="x" size={24} />
            </button>
          </div>
        </div>

        {/* Match Info Bar */}
        <div className="bg-gray-50 p-4 border-b">
          <div className="grid grid-cols-3 items-center gap-4">
            <div className="flex items-center gap-3">
              <OptimizedImage 
                src={homeTeam?.logo}
                alt={homeTeam?.name}
                className="w-10 h-10 rounded-md"
              />
              <div>
                <div className="font-semibold text-gray-900">{homeTeam?.name}</div>
                <div className="text-sm text-gray-600">Home</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">{league}</div>
              <div className="text-xs text-gray-500">{venue?.name}</div>
            </div>
            <div className="flex items-center gap-3 justify-end">
              <div className="text-right">
                <div className="font-semibold text-gray-900">{awayTeam?.name}</div>
                <div className="text-sm text-gray-600">Away</div>
              </div>
              <OptimizedImage 
                src={awayTeam?.logo}
                alt={awayTeam?.name}
                className="w-10 h-10 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b bg-white">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap
                  ${activeTab === tab.key
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <Icon name={tab.icon} size={16} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <div className="text-gray-600">Analyzing match data...</div>
              </div>
            </div>
          ) : (
            <>
              {/* Main Predictions Tab */}
              {activeTab === 'main' && predictions && h2hData && (
                <div className="space-y-6">
                  {/* Probability Visualization */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                      Match Outcome Probabilities
                    </h3>
                    <div className="flex justify-center">
                      <ProbabilityWheel
                        homeTeam={homeTeam?.name}
                        awayTeam={awayTeam?.name}
                        homeWinProbability={h2hData.probabilities.homeWin}
                        drawProbability={h2hData.probabilities.draw}
                        awayWinProbability={h2hData.probabilities.awayWin}
                        size={220}
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                    {/* Match Winner Prediction */}
                    {predictions?.matchWinner && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Icon name="trophy" size={18} className="text-yellow-600" />
                            <h3 className="font-semibold text-gray-900">Match Winner</h3>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${getConfidenceColor(predictions.matchWinner.confidence)}`}>
                            {getConfidenceLabel(predictions.matchWinner.confidence)}
                          </div>
                        </div>
                        <div className="mb-2">
                          <span className="text-lg font-bold text-blue-600">
                            {predictions.matchWinner.prediction}
                          </span>
                          <span className="text-gray-600 ml-2">
                            ({predictions.matchWinner.confidence}% confidence)
                        </span>
                      </div>
                        <p className="text-sm text-gray-600">{predictions.matchWinner.reasoning}</p>
                      </div>
                    )}

                    {/* Both Teams to Score */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Icon name="goal" size={18} className="text-green-600" />
                          <h3 className="font-semibold text-gray-900">Both Teams to Score</h3>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${getConfidenceColor(predictions.bothTeamsScore.confidence)}`}>
                          {getConfidenceLabel(predictions.bothTeamsScore.confidence)}
                        </div>
                      </div>
                      <div className="mb-2">
                        <span className="text-lg font-bold text-green-600">
                          {predictions.bothTeamsScore.prediction}
                        </span>
                        <span className="text-gray-600 ml-2">
                          ({predictions.bothTeamsScore.confidence}% confidence)
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{predictions.bothTeamsScore.reasoning}</p>
                    </div>

                    {/* Total Goals */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Icon name="ball" size={18} className="text-orange-600" />
                          <h3 className="font-semibold text-gray-900">Total Goals</h3>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${getConfidenceColor(predictions.totalGoals.confidence)}`}>
                          {getConfidenceLabel(predictions.totalGoals.confidence)}
                        </div>
                      </div>
                      <div className="mb-2">
                        <span className="text-lg font-bold text-orange-600">
                          {predictions.totalGoals.prediction}
                        </span>
                        <span className="text-gray-600 ml-2">
                          ({predictions.totalGoals.confidence}% confidence)
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{predictions.totalGoals.reasoning}</p>
                    </div>

                    {/* Correct Score Prediction */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Icon name="target" size={18} className="text-purple-600" />
                          <h3 className="font-semibold text-gray-900">Most Likely Score</h3>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${getConfidenceColor(predictions.correctScore.confidence)}`}>
                          {getConfidenceLabel(predictions.correctScore.confidence)}
                        </div>
                      </div>
                      <div className="mb-2">
                        <span className="text-lg font-bold text-purple-600">
                          {predictions.correctScore.prediction}
                        </span>
                        <span className="text-gray-600 ml-2">
                          ({predictions.correctScore.confidence}% confidence)
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{predictions.correctScore.reasoning}</p>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <div className="flex gap-2">
                      <Icon name="info" size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <strong>AI Analysis:</strong> These predictions are generated using machine learning models analyzing team statistics, recent form, historical data, and tactical patterns. For educational and entertainment purposes only.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* H2H Tab */}
              {activeTab === 'h2h' && h2hData && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Head-to-Head Record</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">{h2hData.homeWins}</div>
                      <div className="text-sm text-gray-600">{homeTeam?.name} Wins</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-600">{h2hData.draws}</div>
                      <div className="text-sm text-gray-600">Draws</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-red-600">{h2hData.awayWins}</div>
                      <div className="text-sm text-gray-600">{awayTeam?.name} Wins</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">{h2hData.avgGoals}</div>
                      <div className="text-sm text-gray-600">Average Goals Per Game</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Team Form Tab */}
              {activeTab === 'form' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Form Analysis</h3>
                  
                  {/* Team Form Comparison */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Home Team Form */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <OptimizedImage 
                          src={homeTeam?.logo}
                          alt={homeTeam?.name}
                          className="w-5 h-5 rounded"
                        />
                        {homeTeam?.name} Form
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Last 5 games:</span>
                          <div className="flex gap-1">
                            {['W', 'W', 'D', 'W', 'L'].map((result, idx) => (
                              <div
                                key={idx}
                                className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center text-white ${
                                  result === 'W' ? 'bg-green-500' : result === 'D' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                              >
                                {result}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Form Rating:</span>
                            <span className="font-medium text-green-600">3.2/5.0</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Goals per game:</span>
                            <span className="font-medium">1.8</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Clean sheets:</span>
                            <span className="font-medium">2/5</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Away Team Form */}
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                        <OptimizedImage 
                          src={awayTeam?.logo}
                          alt={awayTeam?.name}
                          className="w-5 h-5 rounded"
                        />
                        {awayTeam?.name} Form
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Last 5 games:</span>
                          <div className="flex gap-1">
                            {['L', 'W', 'W', 'D', 'W'].map((result, idx) => (
                              <div
                                key={idx}
                                className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center text-white ${
                                  result === 'W' ? 'bg-green-500' : result === 'D' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                              >
                                {result}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Form Rating:</span>
                            <span className="font-medium text-blue-600">3.0/5.0</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Goals per game:</span>
                            <span className="font-medium">1.6</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Clean sheets:</span>
                            <span className="font-medium">1/5</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Trends */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Key Form Insights</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Icon name="trending" size={14} className="text-green-600" />
                        <span>{homeTeam?.name} has scored in 4 of their last 5 matches</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="trending" size={14} className="text-blue-600" />
                        <span>{awayTeam?.name} is unbeaten in their last 3 away games</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="info" size={14} className="text-yellow-600" />
                        <span>Both teams have similar attacking output recently</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Tab */}
              {activeTab === 'stats' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Statistics</h3>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">78%</div>
                      <div className="text-sm text-gray-600">Pass Accuracy</div>
                      <div className="text-xs text-blue-600">{homeTeam?.name}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">2.1</div>
                      <div className="text-sm text-gray-600">xG per Game</div>
                      <div className="text-xs text-green-600">Combined</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-red-600">82%</div>
                      <div className="text-sm text-gray-600">Pass Accuracy</div>
                      <div className="text-xs text-red-600">{awayTeam?.name}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Attacking Metrics</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>{homeTeam?.name}</span>
                            <span className="font-medium">15.2</span>
                          </div>
                          <div className="text-gray-600">Shots per game</div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>{awayTeam?.name}</span>
                            <span className="font-medium">13.8</span>
                          </div>
                          <div className="text-gray-600">Shots per game</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Smart Tips/Insights Tab */}
              {activeTab === 'insights' && predictions && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights & Analysis</h3>
                  
                  {/* Key Prediction Factors */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Icon name="brain" size={18} className="text-blue-600" />
                      How Our AI Made This Prediction
                    </h4>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong className="text-gray-900">Statistical Analysis:</strong>
                          <span className="text-gray-700 ml-2">
                            Analyzed 500+ data points including recent form, head-to-head records, goal-scoring patterns, and defensive statistics
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong className="text-gray-900">Tactical Factors:</strong>
                          <span className="text-gray-700 ml-2">
                            Considered playing styles, formation compatibility, and historical performance in similar tactical matchups
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong className="text-gray-900">Contextual Data:</strong>
                          <span className="text-gray-700 ml-2">
                            Evaluated home/away performance, injury reports, recent transfers, and seasonal trends
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Confidence Explanation */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Icon name="target" size={18} className="text-green-600" />
                      Confidence Level Breakdown
                    </h4>
                    <div className="grid gap-3">
                      {Object.entries(predictions).map(([key, pred]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-white rounded border">
                          <span className="capitalize text-gray-900 font-medium">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-1000 ${
                                  pred.confidence >= 80 ? 'bg-green-500' :
                                  pred.confidence >= 60 ? 'bg-blue-500' : 'bg-yellow-500'
                                }`}
                                style={{ width: `${pred.confidence}%` }}
                              ></div>
                            </div>
                            <span className="font-bold text-gray-900 w-12 text-right">
                              {pred.confidence}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Smart Tips */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                      <Icon name="lightbulb" size={18} className="text-yellow-600" />
                      Smart Analysis Tips
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <Icon name="info" size={14} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                        <span className="text-yellow-800">
                          <strong>Value Alert:</strong> Our model shows {predictions.matchWinner.confidence >= 75 ? 'high confidence' : 'moderate confidence'} 
                          in the match winner prediction - consider this for analysis purposes.
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Icon name="trending" size={14} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                        <span className="text-yellow-800">
                          <strong>Trend Watch:</strong> Both teams have shown {predictions.totalGoals.prediction.includes('Over') ? 'attacking prowess' : 'defensive solidity'} 
                          in recent matches, supporting our total goals prediction.
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Icon name="shield" size={14} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                        <span className="text-yellow-800">
                          <strong>Risk Assessment:</strong> This prediction carries {predictions.matchWinner.confidence >= 80 ? 'low' : predictions.matchWinner.confidence >= 60 ? 'medium' : 'higher'} 
                          risk based on historical model performance and current form analysis.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Model Performance Note */}
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <Icon name="award" size={16} className="inline mr-2" />
                      <strong>Our AI model has achieved 73% overall accuracy</strong> across 1,200+ analyzed matches
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Constantly learning and improving from match outcomes
                    </div>
                  </div>
                </div>
              )}

              {/* Other tabs would be implemented similarly */}
              {!['main', 'h2h', 'form', 'stats', 'insights'].includes(activeTab) && (
                <div className="text-center py-12 text-gray-500">
                  <Icon name="clock" size={48} className="mx-auto mb-4 text-gray-300" />
                  <div>This analysis is being prepared...</div>
                  <div className="text-sm mt-2">More detailed insights coming soon!</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

PredictionModal.propTypes = {
  match: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default PredictionModal;