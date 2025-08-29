import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { MatchCard, LoadingSpinner, Icon, Button, ErrorMessage, ErrorBoundary } from '../../shared/components';
import { apiFootball } from '../../shared/services';
import { formatTime, groupMatchesByLeague } from '../../shared/utils';
import { useAsyncData } from '../../shared/hooks';

const Live = () => {
  const navigate = useNavigate();
  const { data: liveMatches, loading, error, execute } = useAsyncData({});
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadLiveMatches = async () => {
    try {
      // Properly call the API method with correct context
      const response = await execute(async () => {
        // Ensure apiFootball service is properly initialized
        if (!apiFootball || typeof apiFootball.getLiveFixtures !== 'function') {
          throw new Error('API service not properly initialized');
        }
        return await apiFootball.getLiveFixtures();
      });
      
      // Robust response handling
      if (response && response.response && Array.isArray(response.response)) {
        const transformedMatches = response.response || [];
        
        const groupedMatches = groupMatchesByLeague(transformedMatches || []);
        setLastUpdated(new Date());
        return groupedMatches;
      } else {
        console.warn('No live matches data received from API');
        return {};
      }
    } catch (error) {
      console.error('Live matches loading error:', error);
      // Don't re-throw here, let useAsyncData handle the error state
      throw new Error(`Failed to load live matches: ${error.message}`);
    }
  };

  useEffect(() => {
    // Safe initial load with error handling
    const initialLoad = async () => {
      try {
        await loadLiveMatches();
      } catch (error) {
        console.error('Initial live matches load failed:', error);
        // Error is already handled by useAsyncData hook
      }
    };
    
    initialLoad();
    
    // Auto-refresh every 30 seconds for live data
    const interval = setInterval(async () => {
      try {
        await loadLiveMatches();
      } catch (error) {
        console.error('Auto-refresh failed:', error);
        // Continue auto-refresh even if one attempt fails
      }
    }, 30000);
    
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  if (loading && Object.keys(liveMatches || {}).length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading live matches..." />
      </div>
    );
  }

  const totalMatches = Object.values(liveMatches || {}).reduce((sum, matches) => sum + matches.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
          <div>
            <h1 className="text-3xl font-bold text-primary">Live Football Matches</h1>
            <p className="text-secondary">
              {totalMatches} live {totalMatches === 1 ? 'match' : 'matches'} currently in progress
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-xs text-secondary">
              Last updated: {formatTime(lastUpdated)}
            </span>
          )}
          <Button 
            onClick={async () => {
              try {
                await loadLiveMatches();
              } catch (error) {
                console.error('Manual refresh failed:', error);
                // Error display is handled by useAsyncData hook
              }
            }} 
            icon="trending" 
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <ErrorMessage error={error} />

      {/* Live Matches by League */}
      {totalMatches > 0 ? (
        <div className="space-y-8">
          {Object.entries(liveMatches || {})
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([leagueName, matches]) => (
              <div key={leagueName} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-border pb-2">
                  <Icon name="live" className="text-red-500 animate-pulse" size={20} />
                  <h2 className="text-xl font-bold text-primary">{leagueName}</h2>
                  <span className="badge badge-live text-xs">
                    {matches.length} Live
                  </span>
                </div>
                
                <div className="space-y-2">
                  {matches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      lastApiUpdate={lastUpdated}
                    />
                  ))}
                </div>
              </div>
            ))
          }
        </div>
      ) : !loading ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚽</div>
          <h2 className="text-xl font-semibold text-primary mb-2">No Live Matches</h2>
          <p className="text-secondary mb-6">
            There are currently no live football matches. Check back later or browse upcoming fixtures.
          </p>
          <Button variant="secondary" onClick={() => navigate('/fixtures')}>
            View Upcoming Fixtures
          </Button>
        </div>
      ) : null}

      {/* Auto-refresh indicator */}
      {totalMatches > 0 && (
        <div className="text-center text-xs text-secondary p-4 bg-glass rounded-lg">
          <Icon name="clock" size={14} className="inline mr-2" />
          Auto-refreshing every 30 seconds
        </div>
      )}
    </div>
  );
};

// Wrap with ErrorBoundary for better error handling
const LiveWithErrorBoundary = () => (
  <ErrorBoundary
    title="Failed to Load Live Matches"
    message="We're having trouble loading live match data. Please try again."
  >
    <Live />
  </ErrorBoundary>
);

export default LiveWithErrorBoundary;