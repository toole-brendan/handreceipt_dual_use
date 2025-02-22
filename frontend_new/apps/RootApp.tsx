import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@shared/contexts/ThemeContext';
import { ServerSelector, LoginForm } from '@shared/components/auth';
import ErrorBoundary from '@shared/components/feedback/ErrorBoundary';
import { ProtectedRoute } from '@shared/components/common';
import { createBaseStore } from '@shared/store/createStore';
import { BaseTheme } from '@shared/styles/theme';
import authReducer from '@shared/store/slices/auth/slice';

// Create the store with base configuration
const store = createBaseStore({
  reducer: {
    auth: authReducer,
    // The api reducer will be added by each app
    api: (state = {}) => state
  }
});

// Import the civilian and defense apps
const CivilianApp = React.lazy(() => import('./civilian/src/app/App'));
const DefenseApp = React.lazy(() => import('./defense/src/app/App'));

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    backgroundColor: '#000',
    color: '#fff' 
  }}>
    Loading Application...
  </div>
);

const RootApp: React.FC = () => {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <ThemeProvider>
          <MuiThemeProvider theme={BaseTheme}>
            <CssBaseline />
            <BrowserRouter>
              <React.Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* Root route shows version selector */}
                  <Route path="/" element={<ServerSelector />} />
                  
                  {/* Civilian routes */}
                  <Route path="/civilian">
                    <Route path="login" element={<LoginForm />} />
                    <Route 
                      path="*" 
                      element={
                        <ProtectedRoute>
                          <CivilianApp />
                        </ProtectedRoute>
                      } 
                    />
                  </Route>
                  
                  {/* Defense routes */}
                  <Route path="/defense">
                    <Route path="login" element={<LoginForm />} />
                    <Route 
                      path="*" 
                      element={
                        <ProtectedRoute>
                          <DefenseApp />
                        </ProtectedRoute>
                      } 
                    />
                  </Route>
                  
                  {/* Fallback route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </React.Suspense>
            </BrowserRouter>
          </MuiThemeProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </Provider>
  );
};

export default RootApp; 