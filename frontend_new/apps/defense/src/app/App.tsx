import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { RouteRenderer } from '@shared/components/routing';
import { ThemeProvider } from '@shared/contexts/ThemeContext';
import { DefenseLayout } from '../components/layout';
import { defenseRoutes } from './routes';
import { defenseTheme } from '../styles/theme';
import { store } from '../store';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <MuiThemeProvider theme={defenseTheme}>
          <CssBaseline />
          <BrowserRouter>
            <DefenseLayout>
              <Suspense fallback={<div>Loading...</div>}>
                <RouteRenderer
                  routes={defenseRoutes}
                  notFoundPath="/not-found"
                />
              </Suspense>
            </DefenseLayout>
          </BrowserRouter>
        </MuiThemeProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
