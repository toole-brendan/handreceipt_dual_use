import React, { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from '@/store';
import theme from '@/styles/theme';
import routes from './routes';
import { updateUser } from '@/store/slices/auth/authSlice';
import { User } from '@/services/auth';

// Initialize auth state
const token = localStorage.getItem('token');
const userString = localStorage.getItem('user');
const user: User | null = userString ? JSON.parse(userString) : null;

if (token && user) {
  // Dispatch login action with existing user data
  store.dispatch(updateUser(user));
}

const App: React.FC = () => {

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={routes} />
      </ThemeProvider>
    </Provider>
  );
};

export default App;
