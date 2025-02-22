import { FC, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const AccountSettings: FC = () => {
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john.doe@army.mil',
  });

  const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordErrors, setPasswordErrors] = useState<Partial<PasswordChangeForm>>({});
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleInputChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handlePasswordChange = (field: keyof PasswordChangeForm) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPasswordForm({
      ...passwordForm,
      [field]: event.target.value,
    });
    // Clear error when field is edited
    if (passwordErrors[field]) {
      setPasswordErrors({
        ...passwordErrors,
        [field]: '',
      });
    }
  };

  const handleSaveChanges = async () => {
    try {
      // TODO: Implement save changes with blockchain
      console.log('Saving changes:', formData);
      // Show success message
    } catch (error) {
      console.error('Error saving changes:', error);
      // Show error message
    }
  };

  const validatePasswordForm = () => {
    const errors: Partial<PasswordChangeForm> = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 12) {
      errors.newPassword = 'Password must be at least 12 characters long';
    }
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    try {
      // TODO: Implement password change with blockchain
      console.log('Changing password:', passwordForm);
      setIsPasswordModalOpen(false);
      // Show success message
    } catch (error) {
      console.error('Error changing password:', error);
      // Show error message
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ color: '#4A5D23', fontWeight: 'bold', mb: 2 }}>
        Account Settings
      </Typography>
      <Typography variant="body2" sx={{ color: '#666666', mb: 3 }}>
        Manage your account details and credentials.
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Personal Information
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={handleInputChange('name')}
              fullWidth
            />
            <TextField
              label="Email"
              value={formData.email}
              onChange={handleInputChange('email')}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleSaveChanges}
                sx={{
                  backgroundColor: '#4A5D23',
                  '&:hover': { backgroundColor: '#3A4D13' },
                }}
              >
                Save Changes
              </Button>
              <Button
                variant="outlined"
                onClick={() => setIsPasswordModalOpen(true)}
                sx={{
                  color: '#666666',
                  borderColor: '#666666',
                  '&:hover': {
                    borderColor: '#444444',
                    backgroundColor: '#f0f0f0',
                  },
                }}
              >
                Change Password
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Password Change Modal */}
      <Dialog
        open={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#4A5D23', color: 'white' }}>
          Change Password
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              type="password"
              label="Current Password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange('currentPassword')}
              error={!!passwordErrors.currentPassword}
              helperText={passwordErrors.currentPassword}
              fullWidth
            />
            <TextField
              type="password"
              label="New Password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange('newPassword')}
              error={!!passwordErrors.newPassword}
              helperText={passwordErrors.newPassword}
              fullWidth
            />
            <TextField
              type="password"
              label="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange('confirmPassword')}
              error={!!passwordErrors.confirmPassword}
              helperText={passwordErrors.confirmPassword}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setIsPasswordModalOpen(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePasswordSubmit}
            variant="contained"
            sx={{
              backgroundColor: '#4A5D23',
              '&:hover': { backgroundColor: '#3A4D13' },
            }}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 