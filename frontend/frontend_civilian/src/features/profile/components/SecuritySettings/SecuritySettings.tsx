import React, { useState } from 'react';
import { Box, Typography, Paper, Switch, FormGroup, FormControlLabel, Grid, Alert, Stack, Button, TextField } from '@mui/material';
import { UserProfile } from '@/types/user';

interface SecuritySettingsProps {
  profile: UserProfile;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [password, setPassword] = useState('');
  const [showMfaSetup, setShowMfaSetup] = useState(false);

  const handleSave = () => {
    // Here you would typically make an API call to save the changes
    console.log('Saving security changes:', { password });
    setIsEditing(false);
    setPassword('');
  };

  const handleMfaSetup = () => {
    setShowMfaSetup(true);
    // Here you would typically make an API call to initiate MFA setup
    console.log('Initiating MFA setup');
  };

  return (
    <Paper 
      sx={{ 
        p: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 2,
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        {isEditing ? (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              onClick={() => {
                setIsEditing(false);
                setPassword('');
              }}
              variant="outlined"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              variant="contained"
              sx={{
                backgroundColor: '#1976d2',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
              }}
            >
              Save Changes
            </Button>
          </Box>
        ) : (
          <Button 
            onClick={() => setIsEditing(true)}
            variant="outlined"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            Change Password
          </Button>
        )}
      </Box>

      <Alert 
        severity="info" 
        sx={{ 
          mb: 4, 
          backgroundColor: 'rgba(13, 59, 85, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          '& .MuiAlert-icon': {
            color: 'rgba(255, 255, 255, 0.7)'
          },
          '& .MuiAlert-message': {
            color: 'rgba(255, 255, 255, 0.9)'
          }
        }}
      >
        Your account security settings are managed in accordance with military security policies.
      </Alert>

      <Grid container spacing={4}>
        {/* Two-Factor Authentication */}
        <Grid item xs={12}>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#fff',
                mb: 2,
                fontSize: '1.1rem',
                fontWeight: 600
              }}
            >
              Two-Factor Authentication
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch 
                    checked={true} 
                    onChange={handleMfaSetup}
                    sx={{
                      '& .MuiSwitch-track': {
                        backgroundColor: 'rgba(255, 255, 255, 0.3) !important'
                      }
                    }}
                  />
                }
                label="Required by policy"
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  '.MuiFormControlLabel-label': { 
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.875rem'
                  }
                }}
              />
            </FormGroup>
            {showMfaSetup && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                  Scan the QR code with your authenticator app to set up MFA
                </Typography>
                <Box sx={{ width: 200, height: 200, backgroundColor: 'rgba(255, 255, 255, 0.1)', mb: 2 }} />
                <TextField
                  label="Enter verification code"
                  size="small"
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                  }}
                />
              </Box>
            )}
          </Box>
        </Grid>

        {/* Password Status */}
        <Grid item xs={12}>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#fff',
                mb: 2,
                fontSize: '1.1rem',
                fontWeight: 600
              }}
            >
              Password Status
            </Typography>
            {isEditing ? (
              <Stack spacing={2}>
                <TextField
                  type="password"
                  label="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '0.875rem',
                    }
                  }}
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.75rem'
                  }}
                >
                  Password must be at least 12 characters long and include uppercase, lowercase, numbers, and special characters
                </Typography>
              </Stack>
            ) : (
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.875rem'
                    }}
                  >
                    Last changed:
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#fff',
                      fontSize: '0.875rem'
                    }}
                  >
                    {new Date().toLocaleDateString()}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 2,
                    py: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 1,
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.875rem'
                    }}
                  >
                    Expires in 60 days
                  </Typography>
                </Box>
              </Stack>
            )}
          </Box>
        </Grid>

        {/* Device Authorization */}
        <Grid item xs={12}>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#fff',
                mb: 2,
                fontSize: '1.1rem',
                fontWeight: 600
              }}
            >
              Device Authorization
            </Typography>
            <Box
              sx={{
                p: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 1,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#fff',
                  fontSize: '0.875rem',
                  mb: 1
                }}
              >
                Current device: Authorized Terminal
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.75rem'
                }}
              >
                Last verified: {new Date().toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SecuritySettings;
