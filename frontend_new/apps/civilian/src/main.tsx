import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider as StoreProvider } from 'react-redux';
import { createAppStore } from '@shared/store';
import { ThemeProvider } from '@shared/contexts';
import type { BaseState } from '@shared/store';

// Import styles
import '@shared/styles/global.css';

// Import environment configuration
import env from './config/env';

// Create store with app-specific configuration
const store = createAppStore<BaseState>({
  preloadedState: {
    auth: {
      token: localStorage.getItem('token'),
      user: JSON.parse(localStorage.getItem('user') || 'null'),
      loading: false,
      error: null,
    },
  },
});

// Import root component
import App from './app/App';

// Create root element
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find root element');

// Create React root
const root = ReactDOM.createRoot(rootElement);

// Render app
root.render(
  <React.StrictMode>
    <StoreProvider store={store}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StoreProvider>
  </React.StrictMode>
);
