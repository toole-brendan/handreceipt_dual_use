import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { createTheme, Theme } from '../styles/theme/index';
import { colors } from '../styles/theme/colors';

export interface ThemeContextType {
  theme: Theme;
  mode: 'light' | 'dark';
  toggleTheme: () => void;
  setMode: (mode: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialMode?: 'light' | 'dark';
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialMode = 'light'
}) => {
  const [mode, setMode] = React.useState<'light' | 'dark'>(
    // Always default to dark mode, but still check local storage for consistency
    () => (localStorage.getItem('theme-mode') as 'light' | 'dark') || 'dark'
  );

  // Create theme based on current mode
  const theme = useMemo(() => createTheme(mode), [mode]);

  // Toggle between light and dark modes
  const toggleTheme = useCallback(() => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme-mode', newMode);
      return newMode;
    });
  }, []);

  // Set specific mode
  const handleSetMode = useCallback((newMode: 'light' | 'dark') => {
    setMode(newMode);
    localStorage.setItem('theme-mode', newMode);
  }, []);

  // Update document background and colors when theme changes
  React.useEffect(() => {
    document.body.style.backgroundColor = colors.background.default;
    document.body.style.color = colors.text.primary;
    // Add a class to help with global dark theme styles
    document.documentElement.classList.toggle('dark-theme', mode === 'dark');
  }, [theme, mode]);

  const contextValue = useMemo(
    () => ({
      theme,
      mode,
      toggleTheme,
      setMode: handleSetMode,
    }),
    [theme, mode, toggleTheme, handleSetMode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Export a hook that just returns the theme object
export const useThemeStyles = (): Theme => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeStyles must be used within a ThemeProvider');
  }
  return context.theme;
};

// Export a hook for just theme toggling
export const useThemeToggle = (): {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
  setMode: (mode: 'light' | 'dark') => void;
} => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeToggle must be used within a ThemeProvider');
  }
  return {
    mode: context.mode,
    toggleTheme: context.toggleTheme,
    setMode: context.setMode,
  };
};
