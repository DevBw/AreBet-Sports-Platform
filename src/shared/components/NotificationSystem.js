// ===============================================
// REAL-TIME NOTIFICATION SYSTEM
// Premium feature for live match updates and alerts
// ===============================================

import React, { useState, useEffect, createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import Button from './Button';
import { GoalIcon, CardIcon, SubstitutionIcon, PlayIcon, StopIcon, TargetIcon, DiamondIcon, AlertIcon, NotificationIcon, CheckIcon } from './SvgIcons';

// Notification Context
const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Notification Provider
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [permission, setPermission] = useState('default');
  const { isPremium } = useAuth();

  useEffect(() => {
    // Check current notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return false;
    }

    if (!isPremium) {
      alert('Notifications are a premium feature. Please upgrade your account.');
      return false;
    }

    const permission = await Notification.requestPermission();
    setPermission(permission);
    return permission === 'granted';
  };

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      timestamp: new Date(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50

    // Show browser notification for premium users
    if (isPremium && permission === 'granted' && notification.showBrowser) {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.type,
        requireInteraction: notification.persistent || false
      });
    }

    return id;
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const value = {
    notifications,
    permission,
    requestPermission,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    unreadCount: notifications.filter(n => !n.read).length
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Notification Bell Component
export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, permission, requestPermission } = useNotifications();
  const { isPremium } = useAuth();

  const getNotificationIcon = (type) => {
    const iconProps = { size: 20, className: "text-current" };
    const icons = {
      goal: <GoalIcon {...iconProps} />,
      card: <CardIcon {...iconProps} />,
      substitution: <SubstitutionIcon {...iconProps} />,
      match_start: <PlayIcon {...iconProps} />,
      match_end: <StopIcon {...iconProps} />,
      prediction: <TargetIcon {...iconProps} />,
      value_bet: <DiamondIcon {...iconProps} />,
      injury: <AlertIcon {...iconProps} />
    };
    return icons[type] || <NotificationIcon {...iconProps} />;
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <NotificationIcon size={24} />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {permission !== 'granted' && isPremium && (
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={requestPermission}
                  >
                    Enable
                  </Button>
                )}
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={markAllAsRead}
                  >
                    Mark all read
                  </Button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="mb-4 flex justify-center">
                  <NotificationIcon size={48} className="text-gray-300" />
                </div>
                <p>No notifications yet</p>
                {!isPremium && (
                  <p className="text-sm mt-2">
                    Upgrade to Premium for real-time alerts
                  </p>
                )}
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 pt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {getTimeAgo(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <Button
                variant="ghost"
                size="small"
                onClick={clearAll}
                className="text-red-600 hover:text-red-700"
              >
                Clear All Notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Live Match Alert Component
export const LiveMatchAlerts = ({ matchId }) => {
  const { addNotification } = useNotifications();
  const { hasFeature } = useAuth();
  const [alertsEnabled, setAlertsEnabled] = useState(false);

  useEffect(() => {
    if (!hasFeature('real_time') || !alertsEnabled) return;

    // Mock live match events - in production, this would connect to WebSocket
    const interval = setInterval(() => {
      const events = [
        { type: 'goal', title: 'GOAL!', message: 'Manchester United scores! 1-0' },
        { type: 'card', title: 'Yellow Card', message: 'Player cautioned for unsporting behavior' },
        { type: 'substitution', title: 'Substitution', message: 'Fresh legs coming on' }
      ];

      const randomEvent = events[Math.floor(Math.random() * events.length)];
      
      addNotification({
        ...randomEvent,
        matchId,
        showBrowser: true,
        persistent: randomEvent.type === 'goal'
      });
    }, 30000); // Every 30 seconds for demo

    return () => clearInterval(interval);
  }, [matchId, alertsEnabled, hasFeature, addNotification]);

  if (!hasFeature('real_time')) return null;

  return (
    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-green-600">
            <NotificationIcon size={20} />
          </div>
          <div>
            <h4 className="font-medium text-green-800">Live Match Alerts</h4>
            <p className="text-sm text-green-700">Get notified of goals, cards, and key events</p>
          </div>
        </div>
        <Button
          variant={alertsEnabled ? 'danger' : 'premium'}
          size="small"
          onClick={() => setAlertsEnabled(!alertsEnabled)}
        >
          {alertsEnabled ? 'Disable' : 'Enable'} Alerts
        </Button>
      </div>
      
      {alertsEnabled && (
        <div className="mt-3 text-xs text-green-600 flex items-center space-x-2">
          <CheckIcon size={14} />
          <span>Alerts enabled for this match</span>
        </div>
      )}
    </div>
  );
};

// Notification types for easy usage
export const createNotification = {
  goal: (team, player) => ({
    type: 'goal',
    title: 'GOAL!',
    message: `${team} scores! ${player}`,
    showBrowser: true,
    persistent: true
  }),
  
  card: (player, type = 'yellow') => ({
    type: 'card',
    title: type === 'red' ? 'Red Card!' : 'Yellow Card',
    message: `${player} receives a ${type} card`,
    showBrowser: true
  }),
  
  matchStart: (homeTeam, awayTeam) => ({
    type: 'match_start',
    title: 'Match Started',
    message: `${homeTeam} vs ${awayTeam} is now live!`,
    showBrowser: true
  }),
  
  prediction: (confidence, outcome) => ({
    type: 'prediction',
    title: 'New Prediction',
    message: `${confidence}% confidence: ${outcome}`,
    showBrowser: false
  }),
  
  valueBet: (match, odds) => ({
    type: 'value_bet',
    title: 'Value Bet Alert',
    message: `Found value bet: ${match} at ${odds}`,
    showBrowser: true,
    persistent: true
  })
};

// Prop types
NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired
};

LiveMatchAlerts.propTypes = {
  matchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default NotificationBell;