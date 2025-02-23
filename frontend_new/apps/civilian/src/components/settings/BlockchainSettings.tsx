import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Tooltip,
  InputAdornment,
  Grid,
} from '@mui/material';
import {
  ContentCopy as ContentCopyIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface BlockchainSettingsProps {
  onSave: () => void;
}

export const BlockchainSettings: React.FC<BlockchainSettingsProps> = ({ onSave }) => {
  const [walletConnected, setWalletConnected] = React.useState(false);
  const [autoPayments, setAutoPayments] = React.useState(false);
  const [qrCodeSize, setQrCodeSize] = React.useState(100);
  const [selectedProperties, setSelectedProperties] = React.useState(['batchNumber', 'roastDate']);
  const [errorCorrection, setErrorCorrection] = React.useState('M');

  // Mock data for smart contracts
  const smartContracts = [
    { name: 'Coffee Payment', address: '0x456...def', status: 'Active' },
    { name: 'Supply Chain', address: '0x789...ghi', status: 'Active' },
  ];

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    // You might want to show a success toast here
  };

  const marks = [
    { value: 50, label: 'Small' },
    { value: 100, label: 'Medium' },
    { value: 150, label: 'Large' },
  ];

  return (
    <Box>
      {/* Wallet Settings Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Wallet Settings
          </Typography>
          <Box sx={{ mt: 2 }}>
            {!walletConnected ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setWalletConnected(true)}
              >
                Connect Wallet
              </Button>
            ) : (
              <Box>
                <TextField
                  fullWidth
                  label="Connected Wallet Address"
                  value="0x123...abc"
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleCopyAddress('0x123...abc')}
                          edge="end"
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setWalletConnected(false)}
                >
                  Disconnect Wallet
                </Button>
              </Box>
            )}
          </Box>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Never share your private keys. Keep them secure.
          </Typography>
        </CardContent>
      </Card>

      {/* Smart Contract Management Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Smart Contract Management</Typography>
            <Button variant="contained" color="primary" size="small">
              Deploy New Contract
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Contract Name</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {smartContracts.map((contract) => (
                  <TableRow key={contract.address}>
                    <TableCell>{contract.name}</TableCell>
                    <TableCell>{contract.address}</TableCell>
                    <TableCell>{contract.status}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary">
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Manage smart contracts for automated transactions.
          </Typography>
        </CardContent>
      </Card>

      {/* USDC Management Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            USDC Management
          </Typography>
          <TextField
            fullWidth
            label="USDC Wallet Address"
            value="0x789...xyz"
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleCopyAddress('0x789...xyz')}
                    edge="end"
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <Button variant="outlined" color="primary" sx={{ mb: 2 }}>
            View Transaction History
          </Button>
          <FormControlLabel
            control={
              <Switch
                checked={autoPayments}
                onChange={(e) => setAutoPayments(e.target.checked)}
                color="primary"
              />
            }
            label="Enable Automatic Payments on Receipt"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Configure settings for USDC stablecoin transactions.
          </Typography>
        </CardContent>
      </Card>

      {/* Digital Twins and QR Codes Card */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Digital Twins and QR Codes
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Default Properties for Digital Twins</InputLabel>
                <Select
                  multiple
                  value={selectedProperties}
                  label="Default Properties for Digital Twins"
                  onChange={(e) => setSelectedProperties(e.target.value as string[])}
                >
                  <MenuItem value="batchNumber">Include Batch Number</MenuItem>
                  <MenuItem value="roastDate">Roast Date</MenuItem>
                  <MenuItem value="origin">Origin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>
                QR Code Size
              </Typography>
              <Slider
                value={qrCodeSize}
                onChange={(_, value) => setQrCodeSize(value as number)}
                min={50}
                max={150}
                step={null}
                marks={marks}
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>QR Code Error Correction Level</InputLabel>
                <Select
                  value={errorCorrection}
                  label="QR Code Error Correction Level"
                  onChange={(e) => setErrorCorrection(e.target.value)}
                >
                  <MenuItem value="L">L - Low</MenuItem>
                  <MenuItem value="M">M - Medium</MenuItem>
                  <MenuItem value="Q">Q - Quartile</MenuItem>
                  <MenuItem value="H">H - High</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <InfoIcon color="action" sx={{ mr: 1 }} fontSize="small" />
                <Typography variant="caption" color="text.secondary">
                  Higher levels provide better error correction but result in larger QR codes.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary">
                Generate Sample QR Code
              </Button>
            </Grid>
          </Grid>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Customize digital twins and QR codes for your inventory.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BlockchainSettings; 