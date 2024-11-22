/* frontend/src/App.tsx */

import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Header from '@/ui/components/common/Header';
import Sidebar from '@/ui/components/common/Sidebar';
import LoadingFallback from '@/ui/components/common/LoadingFallback';
import ErrorBoundary from '@/ui/components/common/ErrorBoundary';
import AppRoutes from '@/routes';
import '@/ui/styles/app.css';
import { ConnectionTest } from '@/components/common/ConnectionTest';
import { SettingsProvider } from '@/contexts/SettingsContext';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <ErrorBoundary>
          <div className="app-layout">
            {process.env.NODE_ENV === 'development' && <ConnectionTest />}
            <Header />
            <div className="app-body">
              <Sidebar />
              <main className="main-content">
                <Suspense fallback={<LoadingFallback />}>
                  <AppRoutes />
                </Suspense>
              </main>
            </div>
          </div>
        </ErrorBoundary>
      </SettingsProvider>
    </BrowserRouter>
  );
};

export default App;