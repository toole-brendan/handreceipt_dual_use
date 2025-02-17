import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { CommandPaletteProvider } from '@handreceipt/shared';
import { store } from '@/store';
import theme from '@/styles/theme';
import routes from './routes';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <CommandPaletteProvider>
          <RouterProvider router={routes} />
        </CommandPaletteProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
