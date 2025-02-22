import { FC, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Chip,
} from '@mui/material';
import { QrCode2 as QrCodeIcon } from '@mui/icons-material';

interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
}

const MOCK_SESSIONS: Session[] = [
  {
    id: '1',
    device: 'Desktop - Windows 10',
    location: 'Fort Campbell',
    lastActive: '10/02/2024 14:30',
  },
  {
    id: '2',
    device: 'Mobile - iOS 16',
    location: 'Fort Campbell',
    lastActive: '10/02/2024 09:15',
  },
];

export const SecuritySettings: FC = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');

  const handleSetup2FA = () => {
    setIs2FAModalOpen(true);
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setVerificationError('Please enter a 6-digit code');
      return;
    }

    try {
      // TODO: Implement 2FA verification with blockchain
      console.log('Verifying 2FA code:', verificationCode);
      setIs2FAEnabled(true);
      setIs2FAModalOpen(false);
      // Show success message
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      setVerificationError('Invalid verification code');
    }
  };

  const handleLogoutSession = async (sessionId: string) => {
    try {
      // TODO: Implement session logout with blockchain
      console.log('Logging out session:', sessionId);
      // Show success message
    } catch (error) {
      console.error('Error logging out session:', error);
      // Show error message
    }
  };

  const handleLogoutAllSessions = async () => {
    try {
      // TODO: Implement all sessions logout with blockchain
      console.log('Logging out all sessions');
      // Show success message
    } catch (error) {
      console.error('Error logging out all sessions:', error);
      // Show error message
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ color: '#4A5D23', fontWeight: 'bold', mb: 2 }}>
        Security Settings
      </Typography>
      <Typography variant="body2" sx={{ color: '#666666', mb: 3 }}>
        Enhance your account security and manage active sessions.
      </Typography>

      {/* 2FA Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Two-Factor Authentication
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add an extra layer of security to your account.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                label={is2FAEnabled ? 'Enabled' : 'Not Set Up'}
                color={is2FAEnabled ? 'success' : 'error'}
              />
              {!is2FAEnabled && (
                <Chip
                  label="Recommended"
                  color="warning"
                  size="small"
                  sx={{ backgroundColor: '#FFC107' }}
                />
              )}
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={handleSetup2FA}
            disabled={is2FAEnabled}
            sx={{
              backgroundColor: '#4A5D23',
              '&:hover': { backgroundColor: '#3A4D13' },
            }}
          >
            {is2FAEnabled ? 'Already Set Up' : 'Set Up 2FA'}
          </Button>
        </CardContent>
      </Card>

      {/* Active Sessions Card */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Active Sessions
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Device</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Last Active</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {MOCK_SESSIONS.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>{session.device}</TableCell>
                    <TableCell>{session.location}</TableCell>
                    <TableCell>{session.lastActive}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleLogoutSession(session.id)}
                      >
                        Log Out
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="error"
              onClick={handleLogoutAllSessions}
            >
              Log Out from All Devices
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* 2FA Setup Modal */}
      <Dialog
        open={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#4A5D23', color: 'white' }}>
          Set Up Two-Factor Authentication
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 1 }}>
            <Typography variant="body1" gutterBottom>
              Scan the QR code with your authenticator app
            </Typography>
            <Paper
              sx={{
                p: 3,
                backgroundColor: '#f5f5f5',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <QrCodeIcon sx={{ fontSize: 150, color: '#4A5D23' }} />
            </Paper>
            <TextField
              label="Verification Code"
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(e.target.value);
                setVerificationError('');
              }}
              error={!!verificationError}
              helperText={verificationError}
              fullWidth
              placeholder="Enter 6-digit code"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIs2FAModalOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleVerifyCode}
            variant="contained"
            sx={{
              backgroundColor: '#4A5D23',
              '&:hover': { backgroundColor: '#3A4D13' },
            }}
          >
            Complete Setup
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 