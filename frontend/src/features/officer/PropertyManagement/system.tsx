import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Alert
} from '@mui/material';

interface SystemSettings {
  autoBackup: boolean;
  backupInterval: number;
  notificationsEnabled: boolean;
  retentionPeriod: number;
  auditLogging: boolean;
  maintenanceMode: boolean;
}

const SystemConfig: React.FC = () => {
  const [settings, setSettings] = React.useState<SystemSettings>({
    autoBackup: true,
    backupInterval: 24,
    notificationsEnabled: true,
    retentionPeriod: 30,
    auditLogging: true,
    maintenanceMode: false
  });
  const [loading, setLoading] = React.useState(true);
  const [saveStatus, setSaveStatus] = React.useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  React.useEffect(() => {
    // TODO: Implement actual settings fetching
    setLoading(false);
  }, []);

  const handleChange = (field: keyof SystemSettings) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' 
      ? event.target.checked 
      : Number(event.target.value);
    
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      // TODO: Implement actual settings saving
      setSaveStatus({
        type: 'success',
        message: 'Settings saved successfully'
      });
      setTimeout(() => setSaveStatus({ type: null, message: '' }), 3000);
    } catch (error) {
      setSaveStatus({
        type: 'error',
        message: 'Failed to save settings'
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        System Configuration
      </Typography>

      {saveStatus.type && (
        <Alert 
          severity={saveStatus.type}
          sx={{ mb: 3 }}
          onClose={() => setSaveStatus({ type: null, message: '' })}
        >
          {saveStatus.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Backup Settings
              </Typography>
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoBackup}
                      onChange={handleChange('autoBackup')}
                    />
                  }
                  label="Automatic Backup"
                />
                <TextField
                  label="Backup Interval (hours)"
                  type="number"
                  value={settings.backupInterval}
                  onChange={handleChange('backupInterval')}
                  disabled={!settings.autoBackup}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Retention Period (days)"
                  type="number"
                  value={settings.retentionPeriod}
                  onChange={handleChange('retentionPeriod')}
                  fullWidth
                  margin="normal"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                System Settings
              </Typography>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notificationsEnabled}
                      onChange={handleChange('notificationsEnabled')}
                    />
                  }
                  label="System Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.auditLogging}
                      onChange={handleChange('auditLogging')}
                    />
                  }
                  label="Audit Logging"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.maintenanceMode}
                      onChange={handleChange('maintenanceMode')}
                    />
                  }
                  label="Maintenance Mode"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Last Backup: 2024-02-09 10:30 AM
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Next Scheduled Backup: 2024-02-10 10:30 AM
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Storage Usage: 45%
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                fullWidth
              >
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemConfig;
