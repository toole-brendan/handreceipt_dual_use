import React from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import { Trash2, Key, Link, Link2Off } from 'lucide-react';
import type { IntegrationsSettings as IntegrationsSettingsType, ApiKey, ConnectedApp } from '@/contexts/SettingsContext';

interface IntegrationsSettingsProps {
  settings: IntegrationsSettingsType;
  onUpdate: (settings: Partial<IntegrationsSettingsType>) => void;
  onGenerateApiKey: () => void;
  onDeleteApiKey: (key: string) => void;
  onConnectApp: (appName: string) => void;
  onDisconnectApp: (appName: string) => void;
}

export const IntegrationsSettings: React.FC<IntegrationsSettingsProps> = ({
  settings,
  onUpdate,
  onGenerateApiKey,
  onDeleteApiKey,
  onConnectApp,
  onDisconnectApp,
}) => {
  const handlePermissionChange = (key: string) => (event: SelectChangeEvent) => {
    const newApiKeys = settings.apiKeys.map((apiKey) =>
      apiKey.key === key
        ? { ...apiKey, permissions: event.target.value as ApiKey['permissions'] }
        : apiKey
    );
    onUpdate({ apiKeys: newApiKeys });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        API Keys
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<Key size={16} />}
          onClick={onGenerateApiKey}
          sx={{ mb: 2 }}
        >
          Generate New API Key
        </Button>
        <TableContainer component={Paper} sx={{ bgcolor: 'rgba(0, 0, 0, 0.2)' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>API Key</TableCell>
                <TableCell>Permissions</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {settings.apiKeys.map((apiKey) => (
                <TableRow key={apiKey.key}>
                  <TableCell
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                    }}
                  >
                    {apiKey.key}
                  </TableCell>
                  <TableCell>
                    <FormControl size="small">
                      <Select
                        value={apiKey.permissions}
                        onChange={handlePermissionChange(apiKey.key)}
                        sx={{ minWidth: 120 }}
                      >
                        <MenuItem value="read-only">Read Only</MenuItem>
                        <MenuItem value="read-write">Read & Write</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>{formatDate(apiKey.created)}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => onDeleteApiKey(apiKey.key)}
                      color="error"
                      size="small"
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {settings.apiKeys.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No API keys generated
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Typography variant="h6" gutterBottom>
        Connected Apps
      </Typography>
      <Grid container spacing={3}>
        {settings.connectedApps.map((app) => (
          <Grid item xs={12} sm={6} md={4} key={app.name}>
            <Card sx={{ bgcolor: 'rgba(0, 0, 0, 0.2)', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">{app.name}</Typography>
                  <Chip
                    label={app.type.toUpperCase()}
                    size="small"
                    color={app.type === 'logistics' ? 'primary' : 'secondary'}
                  />
                </Box>
                {app.connected && app.lastSync && (
                  <Typography variant="body2" color="text.secondary">
                    Last synced: {formatDate(app.lastSync)}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button
                  startIcon={app.connected ? <Link2Off size={16} /> : <Link size={16} />}
                  onClick={() => app.connected ? onDisconnectApp(app.name) : onConnectApp(app.name)}
                  color={app.connected ? 'error' : 'primary'}
                  fullWidth
                >
                  {app.connected ? 'Disconnect' : 'Connect'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default IntegrationsSettings;
