import { useState, useEffect, useCallback } from 'react';

const DEFAULT_PREFERENCES = {
  // Display preferences
  theme: 'dark', // dark, light, auto
  density: 'comfortable', // compact, comfortable, spacious
  
  // Sports preferences
  favoriteLeagues: [], // Array of league IDs/names
  favoriteTeams: [], // Array of team IDs/names
  hiddenLeagues: [], // Array of league IDs to hide
  
  // Notification preferences
  notifications: {
    enabled: true,
    liveMatches: true,
    favoriteTeams: true,
    matchResults: false,
    weeklyDigest: false
  },
  
  // Data preferences
  refreshInterval: 60000, // 60 seconds default
  autoRefresh: true,
  dataUsage: 'normal', // minimal, normal, full
  
  // UI preferences
  defaultTab: 'live', // live, today, upcoming, all
  matchDisplayMode: 'cards', // cards, list, compact
  showLogos: true,
  showOdds: false,
  showPredictions: true,
  
  // Timezone and locale
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  locale: 'en-US',
  dateFormat: 'relative', // relative, absolute, custom
  
  // Advanced preferences
  cacheStrategy: 'smart', // aggressive, smart, minimal
  debugMode: false,
  analyticsEnabled: true,
  
  // Recently viewed
  recentSearches: [],
  recentMatches: [],
  
  // Personalization
  onboardingCompleted: false,
  firstVisit: new Date().toISOString(),
  lastActiveDate: new Date().toISOString(),
  usageStats: {
    sessionsCount: 0,
    totalTimeSpent: 0,
    featuresUsed: {}
  }
};

const STORAGE_KEY = 'arebet_user_preferences';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new preference options
        return {
          ...DEFAULT_PREFERENCES,
          ...parsed,
          notifications: {
            ...DEFAULT_PREFERENCES.notifications,
            ...(parsed.notifications || {})
          },
          usageStats: {
            ...DEFAULT_PREFERENCES.usageStats,
            ...(parsed.usageStats || {})
          }
        };
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
    return DEFAULT_PREFERENCES;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Save preferences to localStorage
  const savePreferences = useCallback((newPreferences) => {
    try {
      const prefsWithTimestamp = {
        ...newPreferences,
        lastUpdated: new Date().toISOString(),
        lastActiveDate: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefsWithTimestamp));
      setLastSaved(new Date());
      return true;
    } catch (error) {
      console.error('Failed to save preferences:', error);
      return false;
    }
  }, []);

  // Update preferences
  const updatePreferences = useCallback((updates) => {
    setPreferences(prev => {
      const newPrefs = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
      savePreferences(newPrefs);
      return newPrefs;
    });
  }, [savePreferences]);

  // Reset to defaults
  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    savePreferences(DEFAULT_PREFERENCES);
  }, [savePreferences]);

  // Specific preference updaters
  const toggleFavoriteLeague = useCallback((leagueId, leagueName) => {
    updatePreferences(prev => {
      const currentFavorites = prev.favoriteLeagues || [];
      const leagueData = { id: leagueId, name: leagueName, addedAt: new Date().toISOString() };
      const isAlreadyFavorite = currentFavorites.some(fav => fav.id === leagueId);
      
      return {
        favoriteLeagues: isAlreadyFavorite
          ? currentFavorites.filter(fav => fav.id !== leagueId)
          : [...currentFavorites, leagueData]
      };
    });
  }, [updatePreferences]);

  const toggleFavoriteTeam = useCallback((teamId, teamName) => {
    updatePreferences(prev => {
      const currentFavorites = prev.favoriteTeams || [];
      const teamData = { id: teamId, name: teamName, addedAt: new Date().toISOString() };
      const isAlreadyFavorite = currentFavorites.some(fav => fav.id === teamId);
      
      return {
        favoriteTeams: isAlreadyFavorite
          ? currentFavorites.filter(fav => fav.id !== teamId)
          : [...currentFavorites, teamData]
      };
    });
  }, [updatePreferences]);

  const addRecentSearch = useCallback((searchTerm, resultType = 'general') => {
    updatePreferences(prev => {
      const recentSearches = prev.recentSearches || [];
      const searchData = {
        term: searchTerm,
        type: resultType,
        timestamp: new Date().toISOString()
      };
      
      // Remove if already exists and add to front
      const filtered = recentSearches.filter(search => search.term !== searchTerm);
      return {
        recentSearches: [searchData, ...filtered].slice(0, 10) // Keep last 10
      };
    });
  }, [updatePreferences]);

  const addRecentMatch = useCallback((matchId, matchData) => {
    updatePreferences(prev => {
      const recentMatches = prev.recentMatches || [];
      const match = {
        id: matchId,
        data: matchData,
        viewedAt: new Date().toISOString()
      };
      
      // Remove if already exists and add to front
      const filtered = recentMatches.filter(m => m.id !== matchId);
      return {
        recentMatches: [match, ...filtered].slice(0, 20) // Keep last 20
      };
    });
  }, [updatePreferences]);

  const updateUsageStats = useCallback((feature, timeSpent = 0) => {
    updatePreferences(prev => {
      const stats = prev.usageStats || DEFAULT_PREFERENCES.usageStats;
      return {
        usageStats: {
          ...stats,
          sessionsCount: stats.sessionsCount + (feature === 'session' ? 1 : 0),
          totalTimeSpent: stats.totalTimeSpent + timeSpent,
          featuresUsed: {
            ...stats.featuresUsed,
            [feature]: (stats.featuresUsed[feature] || 0) + 1
          }
        }
      };
    });
  }, [updatePreferences]);

  const updateNotificationSettings = useCallback((settings) => {
    updatePreferences(prev => ({
      notifications: {
        ...prev.notifications,
        ...settings
      }
    }));
  }, [updatePreferences]);

  // Helper functions
  const isFavoriteLeague = useCallback((leagueId) => {
    return preferences.favoriteLeagues?.some(fav => fav.id === leagueId) || false;
  }, [preferences.favoriteLeagues]);

  const isFavoriteTeam = useCallback((teamId) => {
    return preferences.favoriteTeams?.some(fav => fav.id === teamId) || false;
  }, [preferences.favoriteTeams]);

  const getThemePreference = useCallback(() => {
    if (preferences.theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return preferences.theme;
  }, [preferences.theme]);

  // Export/Import preferences
  const exportPreferences = useCallback(() => {
    try {
      const dataStr = JSON.stringify(preferences, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `arebet-preferences-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Failed to export preferences:', error);
      throw new Error('Failed to export preferences');
    }
  }, [preferences]);

  const importPreferences = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          const merged = {
            ...DEFAULT_PREFERENCES,
            ...imported,
            // Preserve certain local settings
            firstVisit: preferences.firstVisit,
            usageStats: preferences.usageStats
          };
          updatePreferences(merged);
          resolve(merged);
        } catch (error) {
          reject(new Error('Invalid preferences file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, [preferences.firstVisit, preferences.usageStats, updatePreferences]);

  // Auto-save effect
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Update session stats on page unload
      updateUsageStats('session');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [updateUsageStats]);

  // Periodic save effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (preferences && lastSaved && Date.now() - lastSaved.getTime() > CACHE_DURATION) {
        savePreferences(preferences);
      }
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, [preferences, lastSaved, savePreferences]);

  return {
    // State
    preferences,
    isLoading,
    lastSaved,
    
    // Actions
    updatePreferences,
    resetPreferences,
    
    // Specific updaters
    toggleFavoriteLeague,
    toggleFavoriteTeam,
    addRecentSearch,
    addRecentMatch,
    updateUsageStats,
    updateNotificationSettings,
    
    // Helpers
    isFavoriteLeague,
    isFavoriteTeam,
    getThemePreference,
    
    // Import/Export
    exportPreferences,
    importPreferences,
    
    // Constants
    DEFAULT_PREFERENCES
  };
};

export default useUserPreferences;