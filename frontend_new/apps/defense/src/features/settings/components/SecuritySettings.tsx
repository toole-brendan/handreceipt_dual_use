import React, { useState } from 'react';
import { Box, Switch, FormControlLabel, Typography, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { UserProfile } from '@/types/user';

export interface SecuritySettingsProps {
  profile: UserProfile;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ profile }) => {
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  const handleMfaToggle = () => {
    if (!mfaEnabled) {
      setShowMfaSetup(true);
    } else {
      setMfaEnabled(false);
    }
  };

  const handleMfaSetupComplete = () => {
    setShowMfaSetup(false);
    setMfaEnabled(true);
  };

  return (
    <Box>
      <Typography variant="h6">Security Settings</Typography>
      
      <FormControlLabel
        control={<Switch checked={mfaEnabled} onChange={handleMfaToggle} />}
        label="Two-Factor Authentication"
      />

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Security Information</Typography>
        <Typography variant="body2">Last Login: {new Date(profile.lastLogin).toLocaleString()}</Typography>
        <Typography variant="body2">Role: {profile.role}</Typography>
        <Typography variant="body2">Classification: {profile.classification}</Typography>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Button variant="outlined" color="primary" onClick={() => {}}>
          Change Password
        </Button>
      </Box>

      <Dialog open={showMfaSetup} onClose={() => setShowMfaSetup(false)}>
        <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <Typography>
            Two-factor authentication adds an extra layer of security to your account.
            Follow these steps to set it up:
          </Typography>
          {/* MFA setup steps would go here */}
          <Button onClick={handleMfaSetupComplete} sx={{ mt: 2 }}>
            Complete Setup
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SecuritySettings;
