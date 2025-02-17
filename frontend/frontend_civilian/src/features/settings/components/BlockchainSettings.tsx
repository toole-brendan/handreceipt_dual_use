import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  Switch,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Paper,
  Alert,
  SelectChangeEvent,
} from '@mui/material';
import type { BlockchainSettings as BlockchainSettingsType } from '@/contexts/SettingsContext';

interface BlockchainSettingsProps {
  settings: BlockchainSettingsType;
  onUpdate: (settings: Partial<BlockchainSettingsType>) => void;
}

export const BlockchainSettings: React.FC<BlockchainSettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const handleNetworkChange = (event: SelectChangeEvent) => {
    onUpdate({ network: event.target.value as 'mainnet' | 'testnet' });
  };

  const handleTextChange = (field: keyof BlockchainSettingsType) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onUpdate({ [field]: event.target.value });
  };

  const handleKeyManagementChange = (field: keyof BlockchainSettingsType['keyManagement']) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onUpdate({
      keyManagement: {
        ...settings.keyManagement,
        [field]: event.target.checked,
      },
    });
  };

  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const isValidNodeUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Network Configuration
      </Typography>
      <Paper sx={{ 
        p: 3, 
        mb: 4,
        bgcolor: 'rgba(0, 0, 0, 0.2)', 
        backgroundImage: 'none',
        boxShadow: 'none',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FormControl fullWidth>
            <InputLabel id="network-select-label">Network</InputLabel>
            <Select
              labelId="network-select-label"
              value={settings.network}
              label="Network"
              onChange={handleNetworkChange}
            >
              <MenuItem value="mainnet">Mainnet</MenuItem>
              <MenuItem value="testnet">Testnet</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Node URL"
            value={settings.nodeUrl}
            onChange={handleTextChange('nodeUrl')}
            fullWidth
            error={!!settings.nodeUrl && !isValidNodeUrl(settings.nodeUrl)}
            helperText={settings.nodeUrl && !isValidNodeUrl(settings.nodeUrl) ? 'Invalid URL format' : ''}
          />

          {settings.network === 'mainnet' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              You are connected to the mainnet. All transactions will be live and irreversible.
            </Alert>
          )}
        </Box>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Smart Contract Addresses
      </Typography>
      <Paper sx={{ 
        p: 3, 
        mb: 4,
        bgcolor: 'rgba(0, 0, 0, 0.2)', 
        backgroundImage: 'none',
        boxShadow: 'none',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Inventory Contract Address"
            value={settings.inventoryContract}
            onChange={handleTextChange('inventoryContract')}
            fullWidth
            error={!!settings.inventoryContract && !isValidAddress(settings.inventoryContract)}
            helperText={settings.inventoryContract && !isValidAddress(settings.inventoryContract) ? 'Invalid Ethereum address format' : ''}
          />
          <TextField
            label="Shipment Contract Address"
            value={settings.shipmentContract}
            onChange={handleTextChange('shipmentContract')}
            fullWidth
            error={!!settings.shipmentContract && !isValidAddress(settings.shipmentContract)}
            helperText={settings.shipmentContract && !isValidAddress(settings.shipmentContract) ? 'Invalid Ethereum address format' : ''}
          />
        </Box>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Key Management
      </Typography>
      <Paper sx={{ 
        p: 3,
        bgcolor: 'rgba(0, 0, 0, 0.2)', 
        backgroundImage: 'none',
        boxShadow: 'none',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.keyManagement.useHardwareWallet}
                onChange={handleKeyManagementChange('useHardwareWallet')}
              />
            }
            label={
              <Box>
                <Typography variant="body1">Use Hardware Wallet</Typography>
                <Typography variant="body2" color="text.secondary">
                  Recommended: Use a hardware wallet for enhanced security
                </Typography>
              </Box>
            }
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.keyManagement.useSoftwareWallet}
                onChange={handleKeyManagementChange('useSoftwareWallet')}
                disabled={settings.keyManagement.useHardwareWallet}
              />
            }
            label={
              <Box>
                <Typography variant="body1">Use Software Wallet</Typography>
                <Typography variant="body2" color="text.secondary">
                  Less secure: Store keys in a software wallet
                </Typography>
              </Box>
            }
          />
          {!settings.keyManagement.useHardwareWallet && !settings.keyManagement.useSoftwareWallet && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Please select at least one key management option to enable blockchain transactions.
            </Alert>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default BlockchainSettings;
