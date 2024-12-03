/* frontend/src/App.tsx */

import React, { Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '@/shared/components/layout/Layout';
import LoadingFallback from '@/shared/components/feedback/LoadingFallback';
import ErrorBoundary from '@/shared/components/feedback/ErrorBoundary';
import AppRoutes from './routes';
import '@/styles/app.css';
import { SettingsProvider } from '@/contexts/SettingsContext';

const App: React.FC = () => {
  const location = useLocation();
  const isAuthRoute = ['/login', '/create-account', '/forgot-password', '/reset-password'].includes(location.pathname);

  return (
    <SettingsProvider>
      <ErrorBoundary>
        {isAuthRoute ? (
          <Suspense fallback={<LoadingFallback />}>
            <AppRoutes />
          </Suspense>
        ) : (
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <AppRoutes />
            </Suspense>
          </Layout>
        )}
      </ErrorBoundary>
    </SettingsProvider>
  );
};

export default App;