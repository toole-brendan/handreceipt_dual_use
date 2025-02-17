import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  Switch,
  TextField,
  Slider,
  InputAdornment,
} from '@mui/material';
import type { SecuritySettings as SecuritySettingsType } from '@/contexts/SettingsContext';

interface SecuritySettingsProps {
  settings: SecuritySettingsType;
  onUpdate: (settings: Partial<SecuritySettingsType>) => void;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const handlePasswordPolicyChange = (field: keyof SecuritySettingsType['passwordPolicy']) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : Number(event.target.value);
    onUpdate({
      passwordPolicy: {
        ...settings.passwordPolicy,
        [field]: value,
      },
    });
  };

  const handleSwitchChange = (field: keyof SecuritySettingsType) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onUpdate({ [field]: event.target.checked });
  };

  const handleSessionTimeoutChange = (_: Event, value: number | number[]) => {
    onUpdate({ sessionTimeout: value as number });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Password Policy
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
        <TextField
          label="Minimum Length"
          type="number"
          value={settings.passwordPolicy.minLength}
          onChange={handlePasswordPolicyChange('minLength')}
          inputProps={{ min: 6, max: 32 }}
          fullWidth
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings.passwordPolicy.requireUppercase}
              onChange={handlePasswordPolicyChange('requireUppercase')}
            />
          }
          label="Require Uppercase Letters"
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings.passwordPolicy.requireNumbers}
              onChange={handlePasswordPolicyChange('requireNumbers')}
            />
          }
          label="Require Numbers"
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings.passwordPolicy.requireSpecialChars}
              onChange={handlePasswordPolicyChange('requireSpecialChars')}
            />
          }
          label="Require Special Characters"
        />
      </Box>

      <Typography variant="h6" gutterBottom>
        Two-Factor Authentication
      </Typography>
      <Box sx={{ mb: 4 }}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.twoFactorAuth}
              onChange={handleSwitchChange('twoFactorAuth')}
            />
          }
          label="Enable Two-Factor Authentication"
        />
        {settings.twoFactorAuth && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Two-factor authentication adds an extra layer of security to your account.
            You'll need to enter a code from your authenticator app when signing in.
          </Typography>
        )}
      </Box>

      <Typography variant="h6" gutterBottom>
        Session Management
      </Typography>
      <Box sx={{ width: '100%', mb: 2 }}>
        <Typography id="session-timeout-slider" gutterBottom>
          Session Timeout: {settings.sessionTimeout} minutes
        </Typography>
        <Slider
          value={settings.sessionTimeout}
          onChange={handleSessionTimeoutChange}
          aria-labelledby="session-timeout-slider"
          valueLabelDisplay="auto"
          step={5}
          marks
          min={5}
          max={120}
          sx={{ mb: 2 }}
        />
        <Typography variant="body2" color="text.secondary">
          Your session will automatically end after this period of inactivity
        </Typography>
      </Box>
    </Box>
  );
};

export default SecuritySettings;
