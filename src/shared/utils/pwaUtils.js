// ===============================================
// PWA UTILITIES AND SERVICE WORKER MANAGEMENT
// Progressive Web App features and offline support
// ===============================================

import React from 'react';

// Service Worker registration and management
export class ServiceWorkerManager {
  constructor() {
    this.registration = null;
    this.isUpdateAvailable = false;
    this.callbacks = {
      onUpdateAvailable: [],
      onUpdateReady: [],
      onOffline: [],
      onOnline: []
    };
  }

  // Register service worker
  async register() {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('✅ Service Worker registered:', this.registration);

      // Check for updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New update available
              this.isUpdateAvailable = true;
              this.notifyCallbacks('onUpdateAvailable', newWorker);
            } else {
              // First install
              console.log('Service Worker installed for the first time');
            }
          }
        });
      });

      // Handle messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event.data);
      });

      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  // Update service worker
  async update() {
    if (!this.registration) return false;

    try {
      await this.registration.update();
      return true;
    } catch (error) {
      console.error('Service Worker update failed:', error);
      return false;
    }
  }

  // Skip waiting and activate new service worker
  skipWaiting() {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  // Add callback for service worker events
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }

  // Remove callback
  off(event, callback) {
    if (this.callbacks[event]) {
      const index = this.callbacks[event].indexOf(callback);
      if (index > -1) {
        this.callbacks[event].splice(index, 1);
      }
    }
  }

  // Notify callbacks
  notifyCallbacks(event, data) {
    this.callbacks[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Callback error for ${event}:`, error);
      }
    });
  }

  // Handle service worker messages
  handleServiceWorkerMessage(data) {
    switch (data.type) {
      case 'UPDATE_READY':
        this.notifyCallbacks('onUpdateReady', data);
        break;
      case 'CACHE_UPDATED':
        console.log('Cache updated:', data.cacheName);
        break;
      default:
        console.log('Service Worker message:', data);
    }
  }

  // Get cache size
  async getCacheSize() {
    if (!this.registration) return 0;

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.size || 0);
      };

      this.registration.active.postMessage(
        { type: 'GET_CACHE_SIZE' },
        [messageChannel.port2]
      );
    });
  }

  // Clear all caches
  async clearCaches() {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear caches:', error);
      return false;
    }
  }
}

// Network status monitoring
export class NetworkMonitor {
  constructor() {
    this.isOnline = navigator.onLine;
    this.callbacks = {
      onOnline: [],
      onOffline: []
    };
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyCallbacks('onOnline');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyCallbacks('onOffline');
    });
  }

  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }

  off(event, callback) {
    if (this.callbacks[event]) {
      const index = this.callbacks[event].indexOf(callback);
      if (index > -1) {
        this.callbacks[event].splice(index, 1);
      }
    }
  }

  notifyCallbacks(event) {
    this.callbacks[event].forEach(callback => {
      try {
        callback(this.isOnline);
      } catch (error) {
        console.error(`Network callback error for ${event}:`, error);
      }
    });
  }

  // Test network connectivity
  async testConnectivity() {
    try {
      const response = await fetch('/manifest.json', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// PWA Installation prompt
export class PWAInstaller {
  constructor() {
    this.deferredPrompt = null;
    this.isInstallable = false;
    this.isInstalled = false;
    
    this.setupEventListeners();
    this.checkIfInstalled();
  }

  setupEventListeners() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      this.deferredPrompt = e;
      this.isInstallable = true;
      
      console.log('PWA installation available');
    });

    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      console.log('PWA installed successfully');
    });
  }

  checkIfInstalled() {
    // Check if app is running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
    }

    // Check if app was launched from home screen
    if (window.navigator.standalone === true) {
      this.isInstalled = true;
    }
  }

  // Prompt user to install PWA
  async promptInstall() {
    if (!this.deferredPrompt) {
      return { result: 'not_available' };
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      this.deferredPrompt = null;
      
      return { result: outcome };
    } catch (error) {
      console.error('Installation prompt failed:', error);
      return { result: 'error', error };
    }
  }

  // Get installation instructions for different platforms
  getInstallInstructions() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return {
        platform: 'ios',
        steps: [
          'Tap the Share button at the bottom of the screen',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to confirm'
        ]
      };
    } else if (userAgent.includes('android')) {
      return {
        platform: 'android',
        steps: [
          'Tap the menu button (three dots) in the top right',
          'Tap "Add to Home screen"',
          'Tap "Add" to confirm'
        ]
      };
    } else {
      return {
        platform: 'desktop',
        steps: [
          'Look for the install icon in your browser\'s address bar',
          'Click the install button',
          'Follow the prompts to install'
        ]
      };
    }
  }
}

// Background sync management
export class BackgroundSyncManager {
  constructor() {
    this.syncTags = new Set();
  }

  // Register background sync
  async registerSync(tag, data = null) {
    if (!('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      console.warn('Background Sync not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Store data for sync if provided
      if (data) {
        await this.storeDataForSync(tag, data);
      }
      
      await registration.sync.register(tag);
      this.syncTags.add(tag);
      
      console.log('Background sync registered:', tag);
      return true;
    } catch (error) {
      console.error('Background sync registration failed:', error);
      return false;
    }
  }

  // Store data for background sync
  async storeDataForSync(tag, data) {
    try {
      const existingData = JSON.parse(localStorage.getItem(`sync_${tag}`) || '[]');
      existingData.push({
        ...data,
        timestamp: Date.now(),
        id: Math.random().toString(36).substring(2, 15)
      });
      
      localStorage.setItem(`sync_${tag}`, JSON.stringify(existingData));
    } catch (error) {
      console.error('Failed to store sync data:', error);
    }
  }

  // Get pending sync data
  getPendingSyncData(tag) {
    try {
      return JSON.parse(localStorage.getItem(`sync_${tag}`) || '[]');
    } catch (error) {
      console.error('Failed to get sync data:', error);
      return [];
    }
  }

  // Clear sync data after successful sync
  clearSyncData(tag) {
    localStorage.removeItem(`sync_${tag}`);
    this.syncTags.delete(tag);
  }
}

// Push notifications management
export class PushNotificationManager {
  constructor() {
    this.subscription = null;
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported) {
      return 'not_supported';
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      console.error('Notification permission request failed:', error);
      return 'error';
    }
  }

  // Subscribe to push notifications
  async subscribe(vapidPublicKey) {
    if (!this.isSupported || Notification.permission !== 'granted') {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      this.subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      console.log('Push notification subscription created');
      return this.subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe() {
    if (this.subscription) {
      try {
        await this.subscription.unsubscribe();
        this.subscription = null;
        console.log('Push notification unsubscribed');
        return true;
      } catch (error) {
        console.error('Push unsubscription failed:', error);
        return false;
      }
    }
    return true;
  }

  // Get current subscription
  async getSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      this.subscription = await registration.pushManager.getSubscription();
      return this.subscription;
    } catch (error) {
      console.error('Failed to get push subscription:', error);
      return null;
    }
  }

  // Convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// React hooks for PWA features
export const usePWA = () => {
  const [isInstallable, setIsInstallable] = React.useState(false);
  const [isInstalled, setIsInstalled] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = React.useState(false);

  React.useEffect(() => {
    // Initialize PWA managers
    const swManager = new ServiceWorkerManager();
    const networkMonitor = new NetworkMonitor();
    const pwaInstaller = new PWAInstaller();

    // Register service worker
    swManager.register();

    // Setup callbacks
    swManager.on('onUpdateAvailable', () => setUpdateAvailable(true));
    networkMonitor.on('onOnline', () => setIsOnline(true));
    networkMonitor.on('onOffline', () => setIsOnline(false));

    // Update installation states
    setIsInstallable(pwaInstaller.isInstallable);
    setIsInstalled(pwaInstaller.isInstalled);

    return () => {
      // Cleanup would go here
    };
  }, []);

  const installPWA = React.useCallback(async () => {
    const installer = new PWAInstaller();
    return await installer.promptInstall();
  }, []);

  const updatePWA = React.useCallback(() => {
    const swManager = new ServiceWorkerManager();
    swManager.skipWaiting();
    setUpdateAvailable(false);
  }, []);

  return {
    isInstallable,
    isInstalled,
    isOnline,
    updateAvailable,
    installPWA,
    updatePWA
  };
};

// Singleton instances
export const swManager = new ServiceWorkerManager();
export const networkMonitor = new NetworkMonitor();
export const pwaInstaller = new PWAInstaller();
export const backgroundSync = new BackgroundSyncManager();
export const pushManager = new PushNotificationManager();

// Auto-initialize service worker
if (typeof window !== 'undefined') {
  swManager.register();
}

export default {
  ServiceWorkerManager,
  NetworkMonitor,
  PWAInstaller,
  BackgroundSyncManager,
  PushNotificationManager,
  usePWA,
  swManager,
  networkMonitor,
  pwaInstaller,
  backgroundSync,
  pushManager
};