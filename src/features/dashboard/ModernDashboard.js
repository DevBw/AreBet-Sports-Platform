// ===============================================
// MODERN DASHBOARD COMPONENT
// Enhanced dashboard with neural network design and subscription features
// ===============================================

import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { areBetService } from '../../shared/services/SupabaseServiceV2';
import { 
  MatchCard, 
  LoadingSpinner, 
  Button, 
  Card,
  PremiumGate,
  FeatureTeaser,
  BackgroundWrapper,
  ThreeColumnLayout,
  LazyImage
} from '../../shared/components';
import { DashboardSkeleton } from '../../shared/components/SkeletonLoader';

const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

const ModernDashboard = () => {
  const { isPremium, hasFeature } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate] = useState(getTodayDateString());
  const [activeTab, setActiveTab] = useState('live');

  const loadMatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load both live and date-based matches
      const [liveResponse, fixturesResponse] = await Promise.allSettled([
        areBetService.getLiveFixtures(),
        areBetService.getFixtures({ date: selectedDate, limit: 20 })
      ]);

      // Handle live matches
      if (liveResponse.status === 'fulfilled' && liveResponse.value?.response) {
        setLiveMatches(liveResponse.value.response);
      } else {
        setLiveMatches([]);
      }

      // Handle fixtures
      if (fixturesResponse.status === 'fulfilled' && fixturesResponse.value?.response) {
        setMatches(fixturesResponse.value.response);
      } else {
        setMatches([]);
      }

    } catch (err) {
      console.error('Error loading matches:', err);
      setError('Failed to load matches. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadMatches();
    
    // Auto-refresh every 30 seconds for live matches
    const interval = setInterval(loadMatches, 30000);
    return () => clearInterval(interval);
  }, [loadMatches]);

  const handleMatchClick = useCallback((match) => {
    // Navigate to match detail page using React Router
    navigate(`/match/${match.fixture.id}`);
  }, [navigate]);

  // Memoize expensive filtering operations
  const displayMatches = useMemo(() => {
    const todayString = getTodayDateString();
    const now = new Date();
    
    switch (activeTab) {
      case 'live':
        return liveMatches;
      case 'today':
        return matches.filter(m => {
          const matchDate = new Date(m.fixture.date).toISOString().split('T')[0];
          return matchDate === todayString;
        });
      case 'upcoming':
        return matches.filter(m => {
          const matchDate = new Date(m.fixture.date);
          return matchDate > now;
        });
      default:
        return matches;
    }
  }, [activeTab, liveMatches, matches]);

  // Memoize tab counts
  const tabCounts = useMemo(() => {
    const now = new Date();
    
    return {
      live: liveMatches.length,
      today: matches.filter(m => new Date(m.fixture.date).toDateString() === new Date().toDateString()).length,
      upcoming: matches.filter(m => new Date(m.fixture.date) > now).length
    };
  }, [liveMatches, matches]);

  // Combine all matches for search - moved before conditional return
  const allMatches = useMemo(() => [
    ...liveMatches,
    ...matches
  ], [liveMatches, matches]);

  // Prepare tabs data
  const tabsData = [
    { id: 'live', label: 'Live Now', count: tabCounts.live, icon: '🔴' },
    { id: 'today', label: "Today's Matches", count: tabCounts.today, icon: '📅' },
    { id: 'upcoming', label: 'Upcoming', count: tabCounts.upcoming, icon: '⏰' }
  ];

  if (loading && matches.length === 0) {
    return (
      <BackgroundWrapper>
        <ThreeColumnLayout 
          matches={allMatches}
          title="Sports Intelligence Dashboard"
          subtitle="AI-powered insights and predictions for smarter betting decisions"
        >
          <DashboardSkeleton />
        </ThreeColumnLayout>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <ThreeColumnLayout
        matches={allMatches}
        title="Sports Intelligence Dashboard"
        subtitle="AI-powered insights and predictions for smarter betting decisions"
        tabs={tabsData}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        {/* Premium Features Preview */}
        {!isPremium && (
          <div className="mb-8">
            <FeatureTeaser
              feature="predictions"
              title="AI Match Predictions"
              description="Confidence-scored predictions with neural network analysis"
              requiredTier="pro"
              className="mb-4"
            />
            <FeatureTeaser
              feature="value_bets"
              title="Value Bet Detection"
              description="Mathematically advantageous betting opportunities"
              requiredTier="elite"
            />
          </div>
        )}

        {/* Compact Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="small" 
              onClick={loadMatches}
              className="mt-2 text-xs"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Main Matches Grid */}
        {displayMatches.length > 0 ? (
          <div className="space-y-8 fade-in-stagger">
            {/* Group matches by league */}
            {Object.entries(
              displayMatches.reduce((groups, match) => {
                const league = match.league?.name || 'Unknown League';
                if (!groups[league]) {
                  groups[league] = [];
                }
                groups[league].push(match);
                return groups;
              }, {})
            ).map(([leagueName, leagueMatches]) => (
              <div key={leagueName} className="space-y-6">
                {/* Enhanced League Header */}
                <div className="league-header-pro">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <LazyImage
                        src={leagueMatches[0]?.league?.logo || '/api/placeholder/24/24'}
                        alt={leagueName}
                        width="24px"
                        height="24px"
                        className="rounded"
                        fallbackSrc="/api/placeholder/24/24"
                      />
                      <h2 className="league-title-pro">{leagueName}</h2>
                      <span className="px-3 py-1 bg-yellow-500 text-black rounded-full text-sm font-semibold">
                        {leagueMatches.length}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {leagueMatches[0]?.league?.country || 'International'}
                    </div>
                  </div>
                </div>

                {/* Matches Grid */}
                <div className="content-grid">
                  {leagueMatches.map((match) => (
                    <MatchCard
                      key={match.fixture.id}
                      match={match}
                      showPredictions={isPremium || hasFeature('predictions')}
                      showAdvancedStats={hasFeature('advanced_stats')}
                      onClick={() => handleMatchClick(match)}
                      className="transform transition-all duration-300 hover:scale-102"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <div className="text-6xl mb-6">⚽</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              {activeTab === 'live' ? 'No Live Matches' : 'No Matches Found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'live' 
                ? 'Check back later for live matches or browse upcoming fixtures.'
                : 'Try selecting a different date or check back later.'
              }
            </p>
            <Button 
              variant="primary"
              onClick={() => setActiveTab('today')}
            >
              View Today's Matches
            </Button>
          </Card>
        )}

        {/* Premium CTA Section */}
        {!isPremium && (
          <div className="mt-12">
            <PremiumGate
              feature="predictions"
              title="Unlock Premium Insights"
              description="Get access to AI predictions, advanced analytics, and value bet detection"
              className="max-w-2xl mx-auto"
            >
              <div className="p-8 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-xl text-white">
                <h3 className="text-2xl font-bold mb-4">Premium Features</h3>
                <ul className="space-y-2">
                  <li>• AI-powered match predictions</li>
                  <li>• Advanced team analytics</li>
                  <li>• Real-time notifications</li>
                  <li>• Historical trend analysis</li>
                </ul>
              </div>
            </PremiumGate>
          </div>
        )}
      </ThreeColumnLayout>
    </BackgroundWrapper>
  );
};

export default memo(ModernDashboard);