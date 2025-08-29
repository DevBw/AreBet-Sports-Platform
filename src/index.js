import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ErrorBoundary } from './shared/components';
import './styles/design-tokens.css';
import './styles/tailwind.css';
import './styles/design-system.css';
import './styles/components.css';
import './styles/modern-design.css';
import './styles/alignment-fixes.css';
import './styles/visibility-enhancements.css';
import './styles/quick-improvements.css';
import './styles/layout.css';

// Web vitals for performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Report web vitals in production
if (process.env.NODE_ENV === 'production') {
  getCLS(console.log);
  getFID(console.log);
  getFCP(console.log);
  getLCP(console.log);
  getTTFB(console.log);
}

// Configure React DevTools for development
if (process.env.NODE_ENV === 'development') {
  // Suppress React DevTools download message if not installed
  if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    // Create a minimal hook to suppress the warning
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      isDisabled: true,
      supportsFiber: true,
      inject: () => {},
      onCommitFiberRoot: () => {},
      onCommitFiberUnmount: () => {},
    };
  } else if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__.settings) {
    // Configure React DevTools if it's installed
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__.settings.appendOwnerNames = true;
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__.settings.breakOnConsoleErrors = false;
  }
}

// Register service worker for production caching
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
} else if ('serviceWorker' in navigator && process.env.NODE_ENV === 'development') {
  // Unregister service workers in development to prevent cache issues
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
