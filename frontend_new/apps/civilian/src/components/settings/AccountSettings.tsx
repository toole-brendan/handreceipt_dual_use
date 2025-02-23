import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface AccountSettingsProps {
  onSave: () => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ onSave }) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(false);

  const handleClickShowPassword = (field: string) => {
    switch (field) {
      case 'current':
        setShowPassword(!showPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
    }
  };

  return (
    <Box>
      {/* Password Management Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Password Management
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Password"
                type={showPassword ? 'text' : 'password'}
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => handleClickShowPassword('current')}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => handleClickShowPassword('new')}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => handleClickShowPassword('confirm')}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Ensure your new password is at least 8 characters long.
          </Typography>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Two-Factor Authentication
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={twoFactorEnabled}
                  onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label="Enable 2FA"
            />
            {twoFactorEnabled && (
              <Button
                variant="contained"
                color="primary"
                size="small"
                sx={{ ml: 2 }}
              >
                Set Up 2FA
              </Button>
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            Enhance your account security with 2FA.
          </Typography>
        </CardContent>
      </Card>

      {/* Security Questions Card */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Security Questions
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Security Question 1</InputLabel>
                <Select
                  label="Security Question 1"
                  defaultValue="mother"
                >
                  <MenuItem value="mother">What is your mother's maiden name?</MenuItem>
                  <MenuItem value="pet">What was your first pet's name?</MenuItem>
                  <MenuItem value="school">What was the name of your first school?</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Answer 1"
                type="password"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Security Question 2</InputLabel>
                <Select
                  label="Security Question 2"
                  defaultValue="city"
                >
                  <MenuItem value="city">In what city were you born?</MenuItem>
                  <MenuItem value="street">What street did you grow up on?</MenuItem>
                  <MenuItem value="car">What was your first car?</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Answer 2"
                type="password"
                margin="normal"
              />
            </Grid>
          </Grid>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Used for account recovery if you forget your password.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AccountSettings; 