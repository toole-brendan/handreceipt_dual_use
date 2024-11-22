import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface Theme {
  mode: ThemeMode;
  isDark: boolean;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
  };
}

const lightColors = {
  primary: '#007AFF',
  background: '#FFFFFF',
  card: '#F2F2F7',
  text: '#000000',
  border: '#C6C6C8',
  notification: '#FF3B30'
};

const darkColors = {
  primary: '#0A84FF',
  background: '#000000',
  card: '#1C1C1E',
  text: '#FFFFFF',
  border: '#38383A',
  notification: '#FF453A'
};

export const useTheme = () => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  useEffect(() => {
    // Load saved theme preference
    AsyncStorage.getItem('themeMode').then((savedMode) => {
      if (savedMode) {
        setThemeMode(savedMode as ThemeMode);
      }
    });
  }, []);

  const isDark = themeMode === 'system' 
    ? systemColorScheme === 'dark'
    : themeMode === 'dark';

  const theme: Theme = {
    mode: themeMode,
    isDark,
    colors: isDark ? darkColors : lightColors
  };

  const setTheme = async (mode: ThemeMode) => {
    setThemeMode(mode);
    await AsyncStorage.setItem('themeMode', mode);
  };

  return {
    theme,
    setTheme,
    isDark,
    themeMode
  };
};
