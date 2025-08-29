// ===============================================
// REAL-TIME UPDATES SERVICE
// WebSocket-like service for live match updates
// ===============================================

import React from 'react';
import { areBetService } from './SupabaseServiceV2';

class RealtimeService {
  constructor() {
    this.subscriptions = new Map();
    this.intervals = new Map();
    this.isActive = false;
  }

  // Subscribe to live match updates
  subscribeToMatch(matchId, callback, options = {}) {
    const subscriptionKey = `match_${matchId}`;
    
    // Store callback
    if (!this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.set(subscriptionKey, new Set());
    }
    this.subscriptions.get(subscriptionKey).add(callback);

    // Start polling for this match if not already active
    if (!this.intervals.has(subscriptionKey)) {
      this.startMatchPolling(matchId, options);
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscriptions.get(subscriptionKey);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.stopMatchPolling(matchId);
        }
      }
    };
  }

  // Start polling for match updates
  startMatchPolling(matchId, options = {}) {
    const subscriptionKey = `match_${matchId}`;
    const interval = options.interval || 30000; // 30 seconds default
    
    let lastUpdate = null;

    const pollMatch = async () => {
      try {
        // Get current match data
        const response = await areBetService.getFixtures({ id: matchId });
        const match = response?.response?.[0];
        
        if (match) {
          // Check if match data has changed
          const currentHash = this.generateMatchHash(match);
          
          if (currentHash !== lastUpdate) {
            lastUpdate = currentHash;
            
            // Notify all subscribers
            const callbacks = this.subscriptions.get(subscriptionKey);
            if (callbacks) {
              callbacks.forEach(callback => {
                try {
                  callback({
                    type: 'match_update',
                    matchId,
                    data: match,
                    timestamp: new Date()
                  });
                } catch (error) {
                  console.error('Error in realtime callback:', error);
                }
              });
            }

            // Generate synthetic events based on match status
            this.generateSyntheticEvents(match, callbacks);
          }
        }
      } catch (error) {
        console.error('Error polling match data:', error);
      }
    };

    // Initial poll
    pollMatch();
    
    // Set up interval
    const intervalId = setInterval(pollMatch, interval);
    this.intervals.set(subscriptionKey, intervalId);
  }

  // Stop polling for a match
  stopMatchPolling(matchId) {
    const subscriptionKey = `match_${matchId}`;
    const intervalId = this.intervals.get(subscriptionKey);
    
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(subscriptionKey);
    }
    
    this.subscriptions.delete(subscriptionKey);
  }

  // Generate hash for match data to detect changes
  generateMatchHash(match) {
    const relevantData = {
      score: `${match.goals?.home || 0}-${match.goals?.away || 0}`,
      status: match.fixture?.status?.short,
      elapsed: match.fixture?.status?.elapsed,
      events: match.events?.length || 0
    };
    return JSON.stringify(relevantData);
  }

  // Generate synthetic events for demo purposes
  generateSyntheticEvents(match, callbacks) {
    if (!callbacks || match.fixture?.status?.short !== 'LIVE') return;

    // Random event generation for live matches (demo purposes)
    if (Math.random() < 0.3) { // 30% chance per poll
      const events = [
        {
          type: 'goal',
          team: Math.random() > 0.5 ? 'home' : 'away',
          player: 'Player ' + Math.floor(Math.random() * 11 + 1),
          minute: match.fixture?.status?.elapsed || 45
        },
        {
          type: 'card',
          cardType: Math.random() > 0.8 ? 'red' : 'yellow',
          team: Math.random() > 0.5 ? 'home' : 'away',
          player: 'Player ' + Math.floor(Math.random() * 11 + 1),
          minute: match.fixture?.status?.elapsed || 45
        },
        {
          type: 'substitution',
          team: Math.random() > 0.5 ? 'home' : 'away',
          playerOut: 'Player ' + Math.floor(Math.random() * 11 + 1),
          playerIn: 'Player ' + Math.floor(Math.random() * 11 + 1),
          minute: match.fixture?.status?.elapsed || 45
        }
      ];

      const randomEvent = events[Math.floor(Math.random() * events.length)];
      
      callbacks.forEach(callback => {
        try {
          callback({
            type: 'match_event',
            matchId: match.fixture.id,
            event: randomEvent,
            timestamp: new Date()
          });
        } catch (error) {
          console.error('Error in synthetic event callback:', error);
        }
      });
    }
  }

  // Subscribe to league updates
  subscribeToLeague(leagueId, callback, options = {}) {
    const subscriptionKey = `league_${leagueId}`;
    
    if (!this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.set(subscriptionKey, new Set());
    }
    this.subscriptions.get(subscriptionKey).add(callback);

    // Start league polling if not active
    if (!this.intervals.has(subscriptionKey)) {
      this.startLeaguePolling(leagueId, options);
    }

    return () => {
      const callbacks = this.subscriptions.get(subscriptionKey);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.stopLeaguePolling(leagueId);
        }
      }
    };
  }

  startLeaguePolling(leagueId, options = {}) {
    const subscriptionKey = `league_${leagueId}`;
    const interval = options.interval || 60000; // 1 minute default for leagues
    
    const pollLeague = async () => {
      try {
        const response = await areBetService.getFixtures({ 
          league: leagueId, 
          live: true 
        });
        
        if (response?.response) {
          const callbacks = this.subscriptions.get(subscriptionKey);
          if (callbacks) {
            callbacks.forEach(callback => {
              try {
                callback({
                  type: 'league_update',
                  leagueId,
                  liveMatches: response.response,
                  timestamp: new Date()
                });
              } catch (error) {
                console.error('Error in league callback:', error);
              }
            });
          }
        }
      } catch (error) {
        console.error('Error polling league data:', error);
      }
    };

    pollLeague();
    const intervalId = setInterval(pollLeague, interval);
    this.intervals.set(subscriptionKey, intervalId);
  }

  stopLeaguePolling(leagueId) {
    const subscriptionKey = `league_${leagueId}`;
    const intervalId = this.intervals.get(subscriptionKey);
    
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(subscriptionKey);
    }
    
    this.subscriptions.delete(subscriptionKey);
  }

  // Clean up all subscriptions
  destroy() {
    // Clear all intervals
    this.intervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    
    // Clear all data
    this.intervals.clear();
    this.subscriptions.clear();
    this.isActive = false;
  }

  // Get active subscriptions count
  getActiveSubscriptions() {
    return {
      total: this.subscriptions.size,
      matches: Array.from(this.subscriptions.keys())
        .filter(key => key.startsWith('match_')).length,
      leagues: Array.from(this.subscriptions.keys())
        .filter(key => key.startsWith('league_')).length
    };
  }
}

// Create singleton instance
export const realtimeService = new RealtimeService();

// React hook for real-time match updates
export const useRealtimeMatch = (matchId, options = {}) => {
  const [matchData, setMatchData] = React.useState(null);
  const [events, setEvents] = React.useState([]);
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    if (!matchId) return;

    setIsConnected(true);

    const unsubscribe = realtimeService.subscribeToMatch(
      matchId,
      (update) => {
        if (update.type === 'match_update') {
          setMatchData(update.data);
        } else if (update.type === 'match_event') {
          setEvents(prev => [update.event, ...prev.slice(0, 9)]); // Keep last 10 events
        }
      },
      options
    );

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [matchId, options]);

  return {
    matchData,
    events,
    isConnected
  };
};

export default realtimeService;