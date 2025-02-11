import React from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LoadingFallback from '@components/feedback/LoadingFallback';
import ErrorBoundary from '@components/feedback/ErrorBoundary';
import routes from './routes';
import { SettingsProvider } from '@contexts/SettingsContext';
import theme from '@/styles/theme';

// Configure router with hash routing for static hosting
const router = createHashRouter(routes, {
  basename: '' // Explicitly set basename for static hosting
});

const App: React.FC = () => {
  // Wrap the entire app in startTransition
  const [isPending] = React.useTransition();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SettingsProvider>
        <ErrorBoundary>
          <React.Suspense fallback={<LoadingFallback />}>
            <RouterProvider 
              router={router} 
              fallbackElement={isPending ? <LoadingFallback /> : null}
            />
          </React.Suspense>
        </ErrorBoundary>
      </SettingsProvider>
    </ThemeProvider>
  );
};

export default App;
