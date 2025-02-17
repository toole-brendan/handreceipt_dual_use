import React from 'react';
import { Box, Switch, FormControlLabel, Select, MenuItem } from '@mui/material';

export interface AppearanceSettingsProps {
  darkMode: boolean;
  highContrast: boolean;
  fontSize: 'default' | 'large' | 'xlarge';
  toggleDarkMode: () => void;
  toggleHighContrast: () => void;
  setFontSize: (size: 'default' | 'large' | 'xlarge') => void;
}

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  darkMode,
  highContrast,
  fontSize,
  toggleDarkMode,
  toggleHighContrast,
  setFontSize,
}) => {
  return (
    <Box>
      <FormControlLabel
        control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
        label="Dark Mode"
      />
      <FormControlLabel
        control={<Switch checked={highContrast} onChange={toggleHighContrast} />}
        label="High Contrast"
      />
      <Select
        value={fontSize}
        onChange={(e) => setFontSize(e.target.value as 'default' | 'large' | 'xlarge')}
      >
        <MenuItem value="default">Default</MenuItem>
        <MenuItem value="large">Large</MenuItem>
        <MenuItem value="xlarge">Extra Large</MenuItem>
      </Select>
    </Box>
  );
};

export default AppearanceSettings;
