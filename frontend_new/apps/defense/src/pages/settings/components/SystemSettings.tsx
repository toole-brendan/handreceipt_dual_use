import { FC, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import { Upload as UploadIcon, Download as DownloadIcon } from '@mui/icons-material';

const darkTheme = {
  background: '#2a2a2a',
  paper: '#333333',
  text: {
    primary: '#ffffff',
    secondary: '#999999',
  },
  accent: '#00ff00',
  error: '#ff4444',
  border: '#404040',
};

export const SystemSettings: FC = () => {
  const [syncFrequency, setSyncFrequency] = useState('5');
  const [offlineMode, setOfflineMode] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastVerified, setLastVerified] = useState('10/02/2024 14:30');

  const handleSyncFrequencyChange = (event: any) => {
    setSyncFrequency(event.target.value);
  };

  const handleOfflineModeToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOfflineMode(event.target.checked);
  };

  const handleSyncNow = async () => {
    try {
      // TODO: Implement immediate sync with blockchain
      console.log('Syncing data...');
      // Show success message
    } catch (error) {
      console.error('Error syncing data:', error);
      // Show error message
    }
  };

  const handleCreateBackup = async () => {
    setIsProcessing(true);
    try {
      // TODO: Implement backup creation with blockchain
      console.log('Creating backup...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
      setIsBackupModalOpen(false);
      // Show success message
    } catch (error) {
      console.error('Error creating backup:', error);
      // Show error message
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreBackup = async () => {
    setIsProcessing(true);
    try {
      // TODO: Implement backup restoration with blockchain
      console.log('Restoring from backup...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
      setIsRestoreModalOpen(false);
      // Show success message
    } catch (error) {
      console.error('Error restoring backup:', error);
      // Show error message
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyNow = async () => {
    try {
      // TODO: Implement blockchain verification
      console.log('Verifying data integrity...');
      setLastVerified(new Date().toLocaleString());
      // Show success message
    } catch (error) {
      console.error('Error verifying data:', error);
      // Show error message
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ color: darkTheme.text.primary, fontWeight: 'bold', mb: 2 }}>
        System Settings
      </Typography>
      <Typography variant="body2" sx={{ color: darkTheme.text.secondary, mb: 3 }}>
        Configure app behavior and data management.
      </Typography>

      {/* Data Synchronization Card */}
      <Card sx={{ mb: 3, backgroundColor: darkTheme.paper, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: darkTheme.text.primary }} gutterBottom>
            Data Synchronization
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel sx={{ color: darkTheme.text.secondary }}>Sync Frequency</InputLabel>
              <Select
                value={syncFrequency}
                label="Sync Frequency"
                onChange={handleSyncFrequencyChange}
                sx={{
                  color: darkTheme.text.primary,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: darkTheme.border,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: darkTheme.accent,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: darkTheme.accent,
                  },
                }}
              >
                <MenuItem value="5">Every 5 minutes</MenuItem>
                <MenuItem value="15">Every 15 minutes</MenuItem>
                <MenuItem value="30">Every 30 minutes</MenuItem>
                <MenuItem value="manual">Manual Only</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleSyncNow}
              sx={{
                backgroundColor: darkTheme.accent,
                color: '#000000',
                '&:hover': { 
                  backgroundColor: '#00cc00',
                },
              }}
            >
              Sync Now
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Offline Mode Card */}
      <Card sx={{ mb: 3, backgroundColor: darkTheme.paper, borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" sx={{ color: darkTheme.text.primary }} gutterBottom>
                Offline Mode
              </Typography>
              <Typography variant="body2" sx={{ color: darkTheme.text.secondary }}>
                When enabled, actions will be queued and synced when connection is available.
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={offlineMode}
                  onChange={handleOfflineModeToggle}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: darkTheme.accent,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: darkTheme.accent,
                    },
                  }}
                />
              }
              label=""
            />
          </Box>
        </CardContent>
      </Card>

      {/* Backup and Restore Card */}
      <Card sx={{ mb: 3, backgroundColor: darkTheme.paper, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: darkTheme.text.primary }} gutterBottom>
            Backup and Restore
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => setIsBackupModalOpen(true)}
              sx={{
                backgroundColor: darkTheme.accent,
                color: '#000000',
                '&:hover': { 
                  backgroundColor: '#00cc00',
                },
              }}
            >
              Create Backup
            </Button>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => setIsRestoreModalOpen(true)}
              sx={{
                color: darkTheme.accent,
                borderColor: darkTheme.accent,
                '&:hover': {
                  borderColor: '#00cc00',
                  backgroundColor: 'rgba(0, 255, 0, 0.1)',
                },
              }}
            >
              Restore from Backup
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Blockchain Verification Card */}
      <Card sx={{ backgroundColor: darkTheme.paper, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: darkTheme.text.primary }} gutterBottom>
            Blockchain Verification
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: darkTheme.text.secondary }}>
              Last Verified: {lastVerified}
            </Typography>
            <Button
              variant="contained"
              onClick={handleVerifyNow}
              sx={{
                backgroundColor: darkTheme.accent,
                color: '#000000',
                '&:hover': { 
                  backgroundColor: '#00cc00',
                },
              }}
            >
              Verify Now
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Create Backup Modal */}
      <Dialog
        open={isBackupModalOpen}
        onClose={() => !isProcessing && setIsBackupModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: darkTheme.paper,
            color: darkTheme.text.primary,
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${darkTheme.border}` }}>
          Create Backup
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography>
            Are you sure you want to create a backup? This may take a few minutes.
          </Typography>
          {isProcessing && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress 
                sx={{ 
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: darkTheme.accent,
                  },
                  backgroundColor: 'rgba(0, 255, 0, 0.1)',
                }} 
              />
              <Typography variant="body2" sx={{ color: darkTheme.text.secondary, mt: 1 }}>
                Creating backup...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${darkTheme.border}` }}>
          <Button
            onClick={() => setIsBackupModalOpen(false)}
            disabled={isProcessing}
            variant="outlined"
            sx={{
              color: darkTheme.text.primary,
              borderColor: darkTheme.border,
              '&:hover': {
                borderColor: darkTheme.text.primary,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateBackup}
            disabled={isProcessing}
            variant="contained"
            sx={{
              backgroundColor: darkTheme.accent,
              color: '#000000',
              '&:hover': { 
                backgroundColor: '#00cc00',
              },
            }}
          >
            Create Backup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Backup Modal */}
      <Dialog
        open={isRestoreModalOpen}
        onClose={() => !isProcessing && setIsRestoreModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: darkTheme.paper,
            color: darkTheme.text.primary,
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${darkTheme.border}` }}>
          Restore from Backup
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography sx={{ color: darkTheme.error }} gutterBottom>
            Warning: This will overwrite your current data.
          </Typography>
          <Button
            variant="contained"
            component="label"
            disabled={isProcessing}
            sx={{
              mt: 2,
              backgroundColor: darkTheme.accent,
              color: '#000000',
              '&:hover': { 
                backgroundColor: '#00cc00',
              },
            }}
          >
            Select Backup File
            <input type="file" hidden accept=".zip,.bak" />
          </Button>
          {isProcessing && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress 
                sx={{ 
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: darkTheme.accent,
                  },
                  backgroundColor: 'rgba(0, 255, 0, 0.1)',
                }} 
              />
              <Typography variant="body2" sx={{ color: darkTheme.text.secondary, mt: 1 }}>
                Restoring from backup...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${darkTheme.border}` }}>
          <Button
            onClick={() => setIsRestoreModalOpen(false)}
            disabled={isProcessing}
            variant="outlined"
            sx={{
              color: darkTheme.text.primary,
              borderColor: darkTheme.border,
              '&:hover': {
                borderColor: darkTheme.text.primary,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRestoreBackup}
            disabled={isProcessing}
            variant="contained"
            sx={{
              backgroundColor: darkTheme.accent,
              color: '#000000',
              '&:hover': { 
                backgroundColor: '#00cc00',
              },
            }}
          >
            Restore
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 