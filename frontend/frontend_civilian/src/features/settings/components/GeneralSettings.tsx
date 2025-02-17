import React from 'react';
import { Box, TextField, Select, MenuItem, FormControl, InputLabel, Typography, SelectChangeEvent } from '@mui/material';
import type { GeneralSettings as GeneralSettingsType } from '@/contexts/SettingsContext';

const timeZones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
];

const dateFormats = [
  'YYYY-MM-DD',
  'MM/DD/YYYY',
  'DD/MM/YYYY',
  'DD.MM.YYYY',
];

interface GeneralSettingsProps {
  settings: GeneralSettingsType;
  onUpdate: (settings: Partial<GeneralSettingsType>) => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const handleTextChange = (field: keyof GeneralSettingsType) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onUpdate({ [field]: event.target.value });
  };

  const handleSelectChange = (field: keyof GeneralSettingsType) => (
    event: SelectChangeEvent
  ) => {
    onUpdate({ [field]: event.target.value });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Company Information
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
        <TextField
          label="Company Name"
          value={settings.companyName}
          onChange={handleTextChange('companyName')}
          fullWidth
          required
          error={!settings.companyName}
          helperText={!settings.companyName ? 'Company name is required' : ''}
        />
        <TextField
          label="Address"
          value={settings.address}
          onChange={handleTextChange('address')}
          fullWidth
          multiline
          rows={3}
        />
      </Box>

      <Typography variant="h6" gutterBottom>
        Localization
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <FormControl fullWidth>
          <InputLabel id="timezone-label">Time Zone</InputLabel>
          <Select
            labelId="timezone-label"
            value={settings.timeZone}
            onChange={handleSelectChange('timeZone')}
            label="Time Zone"
          >
            {timeZones.map((tz) => (
              <MenuItem key={tz} value={tz}>
                {tz.replace('_', ' ')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="date-format-label">Date Format</InputLabel>
          <Select
            labelId="date-format-label"
            value={settings.dateFormat}
            onChange={handleSelectChange('dateFormat')}
            label="Date Format"
          >
            {dateFormats.map((format) => (
              <MenuItem key={format} value={format}>
                {format}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default GeneralSettings;
