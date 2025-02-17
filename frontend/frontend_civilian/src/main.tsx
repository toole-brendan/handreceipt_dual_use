// Import polyfills first
import './polyfills';

import React, { startTransition } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './app/App';
import '@/styles/index.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { CssBaseline } from '@mui/material';
import ErrorBoundary from '@/components/feedback/ErrorBoundary';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Import fonts
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/600.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

const rootElement = ReactDOM.createRoot(root);

startTransition(() => {
  rootElement.render(
    <React.StrictMode>
      <ErrorBoundary>
        <Provider store={store}>
          <ThemeProvider>
            <CssBaseline />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <App />
            </LocalizationProvider>
          </ThemeProvider>
        </Provider>
      </ErrorBoundary>
    </React.StrictMode>
  );
});
