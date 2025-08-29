import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth';
import { NotificationProvider, LoadingSpinner, BackgroundWrapper } from './shared/components';

// Lazy load components for code splitting
const ModernDashboard = React.lazy(() => import('./features/dashboard/ModernDashboard'));
const ModernMatchDetail = React.lazy(() => import('./features/match-detail/ModernMatchDetail'));
const Fixtures = React.lazy(() => import('./features/fixtures/Fixtures'));
const Table = React.lazy(() => import('./features/table/Table'));
const Stats = React.lazy(() => import('./features/stats/Stats'));
const SubscriptionPage = React.lazy(() => import('./features/subscription/SubscriptionPage'));

// Loading fallback component
const LoadingFallback = () => (
  <BackgroundWrapper>
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="xl" />
      <span className="ml-4 text-lg font-medium text-gray-600">Loading...</span>
    </div>
  </BackgroundWrapper>
);

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="app">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route index element={<ModernDashboard />} />
              <Route path="/dashboard" element={<ModernDashboard />} />
              <Route path="/fixtures" element={<Fixtures />} />
              <Route path="/table" element={<Table />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/match/:id" element={<ModernMatchDetail />} />
              <Route path="/subscription" element={<SubscriptionPage />} />
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;