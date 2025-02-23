import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';

interface IntegrationSettingsProps {
  onSave: () => void;
}

export const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({ onSave }) => {
  const [autoExport, setAutoExport] = React.useState(false);
  const [exportFormat, setExportFormat] = React.useState('CSV');

  // Mock data for API keys
  const apiKeys = [
    { name: 'Accounting API', key: 'xxxx-1234', created: '2023-10-01' },
    { name: 'Inventory API', key: 'xxxx-5678', created: '2023-11-15' },
  ];

  // Mock data for webhooks
  const webhooks = [
    { url: 'https://api.example.com/webhook1', event: 'Order Created', status: 'Active' },
    { url: 'https://api.example.com/webhook2', event: 'Payment Received', status: 'Active' },
  ];

  return (
    <Box>
      {/* API Keys Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">API Keys</Typography>
            <Button variant="contained" color="primary" size="small">
              Generate New API Key
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Key</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apiKeys.map((row) => (
                  <TableRow key={row.key}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.key}</TableCell>
                    <TableCell>{row.created}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                      >
                        Revoke
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Use API keys to integrate with other services securely.
          </Typography>
        </CardContent>
      </Card>

      {/* Webhooks Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Webhooks</Typography>
            <Button variant="contained" color="primary" size="small">
              Add New Webhook
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>URL</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {webhooks.map((row) => (
                  <TableRow key={row.url}>
                    <TableCell>{row.url}</TableCell>
                    <TableCell>{row.event}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Set up webhooks for real-time updates.
          </Typography>
        </CardContent>
      </Card>

      {/* Data Export Settings Card */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Data Export Settings
          </Typography>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Export Format</InputLabel>
              <Select
                value={exportFormat}
                label="Export Format"
                onChange={(e) => setExportFormat(e.target.value)}
              >
                <MenuItem value="CSV">CSV</MenuItem>
                <MenuItem value="JSON">JSON</MenuItem>
                <MenuItem value="XML">XML</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={autoExport}
                  onChange={(e) => setAutoExport(e.target.checked)}
                  color="primary"
                />
              }
              label="Enable Automatic Daily Export"
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Configure how your data is exported for external use.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default IntegrationSettings; 