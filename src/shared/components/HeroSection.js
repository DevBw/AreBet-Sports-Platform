import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { formatTime } from '../utils';

const HeroSection = ({ featuredMatch, liveMatches, onMatchClick }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Select the most important match for hero display
  const heroMatch = featuredMatch || liveMatches?.[0] || null;
  
  if (!heroMatch) {
    return (
      <div className="hero-section no-match">
        <div className="hero-content">
          <div className="hero-title">
            <h1>AreBet Sports Platform</h1>
            <p>Real-time Football Analytics & Predictions</p>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <Icon name="live" size={20} />
              <span>{liveMatches?.length || 0} Live Matches</span>
            </div>
            <div className="stat-item">
              <Icon name="clock" size={20} />
              <span>{formatTime(currentTime)}</span>
            </div>
          </div>
        </div>
        <div className="hero-background">
          <div className="floating-icon"><Icon name="football" size={24} className="text-accent" /></div>
          <div className="floating-icon"><Icon name="trophy" size={24} className="text-accent" /></div>
          <div className="floating-icon"><Icon name="barChart" size={24} className="text-accent" /></div>
        </div>
      </div>
    );
  }

  const { homeTeam, awayTeam, homeScore, awayScore, status, league, date, elapsed } = heroMatch;
  const isLive = ['LIVE', '1H', '2H', 'HT'].includes(status);
  const hasScore = homeScore !== null && awayScore !== null;

  const getLeagueInfo = (leagueName) => {
    const leagues = {
      'Premier League': { color: '#37003c', gradient: 'linear-gradient(135deg, #37003c, #4a0048)' },
      'La Liga': { color: '#ff6900', gradient: 'linear-gradient(135deg, #ff6900, #ff8533)' },
      'Serie A': { color: '#0066cc', gradient: 'linear-gradient(135deg, #0066cc, #3385ff)' },
      'Bundesliga': { color: '#d20515', gradient: 'linear-gradient(135deg, #d20515, #ff3347)' },
      'Ligue 1': { color: '#dae025', gradient: 'linear-gradient(135deg, #dae025, #f0ff58)' },
      'Champions League': { color: '#00347a', gradient: 'linear-gradient(135deg, #00347a, #0066cc)' },
    };
    return leagues[leagueName] || { color: '#666', gradient: 'linear-gradient(135deg, #666, #999)' };
  };

  const leagueInfo = getLeagueInfo(league);

  return (
    <div 
      className={`hero-section featured-match ${isLive ? 'live' : ''}`}
      style={{ '--league-gradient': leagueInfo.gradient }}
    >
      <div className="hero-background">
        <div className="gradient-overlay"></div>
        <div className="pattern-overlay"></div>
        {isLive && <div className="live-pulse"></div>}
      </div>

      <div className="hero-content" onClick={() => onMatchClick?.(heroMatch)}>
        {/* Hero Header */}
        <div className="hero-header">
          <div className="match-status">
            {isLive ? (
              <div className="live-status">
                <div className="live-dot"></div>
                <span>LIVE • {elapsed}'</span>
              </div>
            ) : (
              <div className="upcoming-status">
                <Icon name="clock" size={16} />
                <span>{new Date(date).toLocaleString()}</span>
              </div>
            )}
          </div>
          <div className="league-info">
            <span className="league-name">{league}</span>
          </div>
        </div>

        {/* Hero Match */}
        <div className="hero-match">
          {/* Home Team */}
          <div className="hero-team home">
            <div className="team-logo-wrapper">
              <img 
                src={homeTeam?.logo || `https://via.placeholder.com/80x80?text=${homeTeam?.name?.charAt(0)}`}
                alt={homeTeam?.name}
                className="hero-team-logo"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/80x80?text=${homeTeam?.name?.charAt(0)}`;
                }}
              />
            </div>
            <div className="team-details">
              <h2 className="team-name">{homeTeam?.name}</h2>
              <div className="team-form">
                <span className="form-indicator">W</span>
                <span className="form-indicator">L</span>
                <span className="form-indicator">W</span>
                <span className="form-indicator">W</span>
                <span className="form-indicator">D</span>
              </div>
            </div>
          </div>

          {/* Score Section */}
          <div className="hero-score">
            {hasScore ? (
              <div className="score-display">
                <span className="score home">{(() => {
                  return typeof homeScore === 'object' ? (homeScore?.home || homeScore?.total || 0) : (homeScore ?? 0);
                })()}</span>
                <span className="separator">:</span>
                <span className="score away">{(() => {
                  return typeof awayScore === 'object' ? (awayScore?.away || awayScore?.total || 0) : (awayScore ?? 0);
                })()}</span>
              </div>
            ) : (
              <div className="vs-display">
                <span className="vs-text">VS</span>
                <div className="match-time">
                  {formatTime(date)} 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            )}
            {isLive && (
              <div className="live-stats">
                <div className="possession">
                  <span>Possession</span>
                  <div className="possession-bar">
                    <div className="home-possession" style={{ width: '58%' }}></div>
                    <div className="away-possession" style={{ width: '42%' }}></div>
                  </div>
                  <div className="possession-values">
                    <span>58%</span>
                    <span>42%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="hero-team away">
            <div className="team-details">
              <h2 className="team-name">{awayTeam?.name}</h2>
              <div className="team-form">
                <span className="form-indicator">D</span>
                <span className="form-indicator">W</span>
                <span className="form-indicator">W</span>
                <span className="form-indicator">L</span>
                <span className="form-indicator">W</span>
              </div>
            </div>
            <div className="team-logo-wrapper">
              <img 
                src={awayTeam?.logo || `https://via.placeholder.com/80x80?text=${awayTeam?.name?.charAt(0)}`}
                alt={awayTeam?.name}
                className="hero-team-logo"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/80x80?text=${awayTeam?.name?.charAt(0)}`;
                }}
              />
            </div>
          </div>
        </div>

        {/* Hero Footer */}
        <div className="hero-footer">
          <div className="match-info">
            <div className="info-item">
              <Icon name="flag" size={16} />
              <span>Venue Info</span>
            </div>
            <div className="info-item">
              <Icon name="users" size={16} />
              <span>45,000 Capacity</span>
            </div>
            <div className="info-item">
              <Icon name="target" size={16} />
              <span>Click for Details</span>
            </div>
          </div>
          {liveMatches && liveMatches.length > 1 && (
            <div className="other-live">
              <span>+{liveMatches.length - 1} more live matches</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;