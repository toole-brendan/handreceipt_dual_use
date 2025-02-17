import React from 'react';
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  SelectChangeEvent,
} from '@mui/material';
import type { AppearanceSettings as AppearanceSettingsType } from '@/contexts/SettingsContext';

interface AppearanceSettingsProps {
  settings: AppearanceSettingsType;
  onUpdate: (settings: Partial<AppearanceSettingsType>) => void;
}

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const handleSwitchChange = (field: keyof AppearanceSettingsType) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onUpdate({ [field]: event.target.checked });
  };

  const handleFontSizeChange = (event: SelectChangeEvent) => {
    onUpdate({ fontSize: event.target.value as AppearanceSettingsType['fontSize'] });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Theme
      </Typography>
      <Paper sx={{ 
        p: 3, 
        mb: 4,
        bgcolor: 'rgba(0, 0, 0, 0.2)', 
        backgroundImage: 'none',
        boxShadow: 'none',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.darkMode}
                onChange={handleSwitchChange('darkMode')}
              />
            }
            label={
              <Box>
                <Typography variant="body1">Dark Mode</Typography>
                <Typography variant="body2" color="text.secondary">
                  Use dark theme for reduced eye strain
                </Typography>
              </Box>
            }
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.highContrast}
                onChange={handleSwitchChange('highContrast')}
              />
            }
            label={
              <Box>
                <Typography variant="body1">High Contrast</Typography>
                <Typography variant="body2" color="text.secondary">
                  Increase contrast for better visibility
                </Typography>
              </Box>
            }
          />
        </Box>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Text Size
      </Typography>
      <Paper sx={{ 
        p: 3,
        bgcolor: 'rgba(0, 0, 0, 0.2)', 
        backgroundImage: 'none',
        boxShadow: 'none',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <FormControl fullWidth>
          <InputLabel id="font-size-select-label">Font Size</InputLabel>
          <Select
            labelId="font-size-select-label"
            value={settings.fontSize}
            label="Font Size"
            onChange={handleFontSizeChange}
          >
            <MenuItem value="default">Default</MenuItem>
            <MenuItem value="large">Large</MenuItem>
            <MenuItem value="xlarge">Extra Large</MenuItem>
          </Select>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Adjust the text size throughout the application. Changes will apply immediately.
          </Typography>
        </FormControl>
      </Paper>
    </Box>
  );
};

export default AppearanceSettings;
