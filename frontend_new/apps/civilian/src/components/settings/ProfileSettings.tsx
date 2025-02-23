import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  styled,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface ProfileSettingsProps {
  onSave: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onSave }) => {
  const [profileImage, setProfileImage] = React.useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box>
      {/* Personal Information Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Personal Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Full Name"
                defaultValue="John Doe"
                margin="normal"
              />
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                defaultValue="john@example.com"
                margin="normal"
              />
              <TextField
                fullWidth
                label="Phone Number"
                defaultValue="+1 234 567 8900"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Avatar
                  src={profileImage || undefined}
                  sx={{ width: 100, height: 100, mb: 2 }}
                />
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  size="small"
                >
                  Upload Image
                  <VisuallyHiddenInput
                    type="file"
                    accept=".jpg,.png"
                    onChange={handleImageUpload}
                  />
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
            Update your personal details here.
          </Typography>
        </CardContent>
      </Card>

      {/* Business Information Card */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Business Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Name"
                defaultValue="BeanRoast Co."
                margin="normal"
              />
              <TextField
                fullWidth
                label="Business Address"
                defaultValue="123 Coffee St, Bean City, CA 90210"
                multiline
                rows={3}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Tax ID"
                defaultValue="12-3456789"
                margin="normal"
                inputProps={{
                  pattern: '[0-9]{2}-[0-9]{7}',
                  title: 'Please enter a valid Tax ID (XX-XXXXXXX)',
                }}
              />
            </Grid>
          </Grid>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
            Provide your business details for invoices and tax purposes.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfileSettings; 