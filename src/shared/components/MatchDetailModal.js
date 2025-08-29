import React, { useState, useEffect, useCallback } from 'react';
import Icon from './Icon';
import { apiFootball } from '../services';
import { formatDetailDate, formatTime } from '../utils';

const MatchDetailModal = ({ match, isOpen, onClose }) => {
  
  const [matchDetails, setMatchDetails] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const loadMatchDetails = useCallback(async () => {
    try {
      setLoading(true);

      // Load multiple data sources in parallel using apiFootball service
      const [fixtureData, predictionData, statisticsData] = await Promise.all([
        // Fixture details
        apiFootball.getFixtures({ id: match.id }),
        // Predictions
        apiFootball.getPredictions(match.id),
        // Head to head statistics
        apiFootball.getHeadToHead(`${match.homeTeam.id}-${match.awayTeam.id}`)
      ]);

      setMatchDetails(fixtureData.response?.[0] || null);
      setPredictions(predictionData.response?.[0] || null);
      setStatistics(statisticsData.response || []);

    } catch (error) {
      // Error loading match details
    } finally {
      setLoading(false);
    }
  }, [match]);

  useEffect(() => {
    if (isOpen && match) {
      loadMatchDetails();
    }
  }, [isOpen, match, loadMatchDetails]);

  const getPredictionIcon = (prediction) => {
    if (prediction === 'home') return <Icon name="home" size={32} className="text-accent" />;
    if (prediction === 'away') return <Icon name="plane" size={32} className="text-accent" />;
    return <Icon name="minus" size={32} className="text-accent" />;
  };

  const getFormIcon = (form) => {
    if (!form) return <Icon name="help_circle" size={16} className="text-secondary" />;
    const recentForm = form.slice(-1);
    if (recentForm === 'W') return <Icon name="check_circle" size={16} className="text-green-400" />;
    if (recentForm === 'D') return <Icon name="minus" size={16} className="text-yellow-400" />;
    if (recentForm === 'L') return <Icon name="x_circle" size={16} className="text-red-400" />;
    return <Icon name="help_circle" size={16} className="text-secondary" />;
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999] p-5">
      <div className="card max-w-4xl w-full max-h-[90vh] overflow-hidden border-2 border-accent">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-primary">Match Details</h2>
            {match.status && (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                ['LIVE', '1H', '2H'].includes(match.status) 
                  ? 'bg-accent text-primary animate-pulse' 
                  : match.status === 'FT' 
                    ? 'bg-glass text-secondary'
                    : 'bg-warning bg-opacity-20 text-warning'
              }`}>
                {match.status}
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-glass rounded-lg transition-colors"
          >
            <Icon name="x" size={20} className="text-secondary" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border">
          {[
            { id: 'overview', label: 'Overview', icon: 'info' },
            { id: 'predictions', label: 'Predictions', icon: 'target' },
            { id: 'statistics', label: 'Head to Head', icon: 'barChart' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'text-accent border-b-2 border-accent' 
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-12">
              <div className="spinner w-8 h-8 mx-auto mb-4"></div>
              <p className="text-secondary">Loading match details...</p>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Match Header */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-8 mb-4">
                      <div className="text-center">
                        <img 
                          src={match.homeTeam?.logo} 
                          alt={match.homeTeam?.name}
                          className="w-16 h-16 mx-auto mb-2"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <h3 className="font-semibold text-primary">{match.homeTeam?.name}</h3>
                        <div className="text-xs text-secondary">Home</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-3xl font-bold text-accent mb-1">
                          {match.homeScore ?? 0} - {match.awayScore ?? 0}
                        </div>
                        <div className="text-sm text-secondary">
                          {match.league?.name || match.league} • {match.venue?.name || match.venue?.city || 'Venue'}
                        </div>
                        <div className="text-xs text-secondary mt-1">
                          {formatDetailDate(match.date)} • {formatTime(match.date)}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <img 
                          src={match.awayTeam?.logo} 
                          alt={match.awayTeam?.name}
                          className="w-16 h-16 mx-auto mb-2"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <h3 className="font-semibold text-primary">{match.awayTeam?.name}</h3>
                        <div className="text-xs text-secondary">Away</div>
                      </div>
                    </div>
                  </div>

                  {/* Match Info */}
                  {matchDetails && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="card">
                        <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                          <Icon name="info" size={16} className="text-accent" />
                          Match Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-secondary">Referee:</span>
                            <span className="text-primary">{matchDetails.fixture?.referee || 'TBD'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-secondary">Venue:</span>
                            <span className="text-primary">{matchDetails.fixture?.venue?.name || 'TBD'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-secondary">City:</span>
                            <span className="text-primary">{matchDetails.fixture?.venue?.city || 'TBD'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-secondary">Temperature:</span>
                            <span className="text-primary">{matchDetails.fixture?.status?.short !== 'NS' ? 'Live Data' : 'TBD'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="card">
                        <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                          <Icon name="clock" size={16} className="text-accent" />
                          Match Timeline
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-secondary">Status:</span>
                            <span className="text-primary">{match.status}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-secondary">Kick Off:</span>
                            <span className="text-primary">{formatTime(match.date)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-secondary">Elapsed:</span>
                            <span className="text-primary">{match.elapsed ? `${match.elapsed}'` : 'Not Started'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-secondary">Period:</span>
                            <span className="text-primary">{match.status === 'HT' ? 'Half Time' : match.status === 'FT' ? 'Full Time' : 'In Progress'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Predictions Tab */}
              {activeTab === 'predictions' && (
                <div className="space-y-6">
                  {predictions ? (
                    <>
                      {/* Main Prediction */}
                      <div className="card text-center">
                        <h4 className="font-semibold text-primary mb-4 flex items-center justify-center gap-2">
                          <Icon name="target" size={16} className="text-accent" />
                          Match Prediction
                        </h4>
                        <div className="mb-2">{getPredictionIcon(predictions.predictions?.winner?.name)}</div>
                        <div className="text-lg font-semibold text-accent mb-2">
                          {predictions.predictions?.winner?.name === 'home' ? match.homeTeam?.name : 
                           predictions.predictions?.winner?.name === 'away' ? match.awayTeam?.name : 'Draw'}
                        </div>
                        <div className="text-sm text-secondary">
                          Confidence: {predictions.predictions?.winner?.comment || 'Moderate'}
                        </div>
                      </div>

                      {/* Predictions Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="card text-center">
                          <h5 className="font-medium text-primary mb-2">Goals</h5>
                          <div className="text-xl font-bold text-accent">
                            {(() => {
                              const homeGoals = predictions.predictions?.goals?.home;
                              const awayGoals = predictions.predictions?.goals?.away;
                              const homeScore = typeof homeGoals === 'object' ? (homeGoals?.total || '?') : (homeGoals || '?');
                              const awayScore = typeof awayGoals === 'object' ? (awayGoals?.total || '?') : (awayGoals || '?');
                              return `${homeScore} - ${awayScore}`;
                            })()}
                          </div>
                          <div className="text-xs text-secondary mt-1">Predicted Score</div>
                        </div>

                        <div className="card text-center">
                          <h5 className="font-medium text-primary mb-2">Both Teams Score</h5>
                          <div className="text-xl font-bold text-accent">
                            {predictions.predictions?.goals?.both_teams_score ? 'Yes' : 'No'}
                          </div>
                          <div className="text-xs text-secondary mt-1">BTTS Prediction</div>
                        </div>

                        <div className="card text-center">
                          <h5 className="font-medium text-primary mb-2">Total Goals</h5>
                          <div className="text-xl font-bold text-accent">
                            {(() => {
                              const totalGoals = predictions.predictions?.goals?.total;
                              return typeof totalGoals === 'object' ? (totalGoals?.total || '2.5+') : (totalGoals || '2.5+');
                            })()}
                          </div>
                          <div className="text-xs text-secondary mt-1">Over/Under</div>
                        </div>
                      </div>

                      {/* Team Comparison */}
                      <div className="card">
                        <h4 className="font-semibold text-primary mb-4 flex items-center gap-2">
                          <Icon name="users" size={16} className="text-accent" />
                          Team Comparison
                        </h4>
                        <div className="space-y-4">
                          {/* Form */}
                          <div className="flex items-center justify-between">
                            <div className="text-center flex-1">
                              <div className="text-sm text-secondary mb-1">Recent Form</div>
                              <div className="flex items-center justify-center gap-1">
                                {predictions.teams?.home?.last_5?.form?.split('').map((result, index) => (
                                  <span key={index} className="inline-flex">{getFormIcon(result)}</span>
                                )) || Array(5).fill(0).map((_, i) => <span key={i} className="inline-flex"><Icon name="help_circle" size={16} className="text-secondary" /></span>)}
                              </div>
                            </div>
                            <div className="text-center px-4">
                              <div className="text-xs text-secondary">vs</div>
                            </div>
                            <div className="text-center flex-1">
                              <div className="text-sm text-secondary mb-1">Recent Form</div>
                              <div className="flex items-center justify-center gap-1">
                                {predictions.teams?.away?.last_5?.form?.split('').map((result, index) => (
                                  <span key={index} className="inline-flex">{getFormIcon(result)}</span>
                                )) || Array(5).fill(0).map((_, i) => <span key={i} className="inline-flex"><Icon name="help_circle" size={16} className="text-secondary" /></span>)}
                              </div>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-4 text-center text-sm">
                            <div>
                              <div className="font-semibold text-accent">{(() => {
                                const goalsFor = predictions.teams?.home?.league?.goals?.for;
                                return typeof goalsFor === 'object' ? (goalsFor?.total || goalsFor?.home || 0) : (goalsFor?.total || 0);
                              })()}</div>
                              <div className="text-secondary">Goals For</div>
                            </div>
                            <div>
                              <div className="font-semibold text-primary">Goals</div>
                            </div>
                            <div>
                              <div className="font-semibold text-accent">{(() => {
                                const goalsFor = predictions.teams?.away?.league?.goals?.for;
                                return typeof goalsFor === 'object' ? (goalsFor?.total || goalsFor?.away || 0) : (goalsFor?.total || 0);
                              })()}</div>
                              <div className="text-secondary">Goals For</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mb-2"><Icon name="crystal_ball" size={48} className="text-secondary" /></div>
                      <div className="text-lg font-semibold text-primary mb-2">Predictions Not Available</div>
                      <div className="text-sm text-secondary">Prediction data is not available for this match.</div>
                    </div>
                  )}
                </div>
              )}

              {/* Statistics Tab */}
              {activeTab === 'statistics' && (
                <div className="space-y-6">
                  {statistics && statistics.length > 0 ? (
                    <>
                      <div className="card">
                        <h4 className="font-semibold text-primary mb-4 flex items-center gap-2">
                          <Icon name="barChart" size={16} className="text-accent" />
                          Head to Head Record
                        </h4>
                        <div className="text-center mb-4">
                          <div className="text-sm text-secondary">Last {statistics?.length || 0} meetings</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {statistics?.slice(0, 5).map((game, index) => (
                          <div key={index} className="card">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="text-xs text-secondary">
                                  {formatDetailDate(game.fixture?.date)}
                                </div>
                                <div className="text-sm text-primary">
                                  {game.teams?.home?.name} vs {game.teams?.away?.name}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-sm font-semibold text-accent">
                                  {(() => {
                                    const homeGoals = game.goals?.home;
                                    const awayGoals = game.goals?.away;
                                    const homeScore = typeof homeGoals === 'object' ? (homeGoals?.total || 0) : (homeGoals || 0);
                                    const awayScore = typeof awayGoals === 'object' ? (awayGoals?.total || 0) : (awayGoals || 0);
                                    return `${homeScore} - ${awayScore}`;
                                  })()}
                                </div>
                                <div className="text-xs text-secondary">
                                  {game.league?.name}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mb-2"><Icon name="barChart" size={48} className="text-secondary" /></div>
                      <div className="text-lg font-semibold text-primary mb-2">No Head to Head Data</div>
                      <div className="text-sm text-secondary">These teams haven't played recently or data is not available.</div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchDetailModal;
