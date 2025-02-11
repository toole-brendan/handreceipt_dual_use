import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Divider, Stack, TextField, Button } from '@mui/material';
import { UserProfile } from '../../../../types/user';

interface ProfileDetailsProps {
  profile: UserProfile;
  onUpdate?: () => void;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ profile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Here you would typically make an API call to save the changes
    console.log('Saving profile changes:', editedProfile);
    setIsEditing(false);
  };

  const renderEditableField = (label: string, field: keyof UserProfile, value: string | undefined) => {
    return (
      <Box>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            mb: 1,
            fontSize: '0.875rem',
            fontWeight: 500
          }}
        >
          {label}
        </Typography>
        {isEditing ? (
          <TextField
            value={value || ''}
            onChange={(e) => handleChange(field, e.target.value)}
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
              '& .MuiInputBase-input': {
                fontSize: '0.875rem',
              }
            }}
          />
        ) : (
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#fff',
              fontSize: '1rem'
            }}
          >
            {value || 'Not specified'}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Paper 
      className="profile-details" 
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
              onClick={() => setIsEditing(false)}
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
            Edit Profile
          </Button>
        )}
      </Box>

      {/* Essential Information Section */}
      <Box mb={4}>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            color: '#fff',
            mb: 3,
            fontSize: '1.25rem',
            fontWeight: 600,
            letterSpacing: '0.02em'
          }}
        >
          Essential Information
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <Stack spacing={3}>
              {renderEditableField('Full Name', 'firstName', editedProfile.firstName)}
              {renderEditableField('DOD ID', 'dodId', editedProfile.dodId)}
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack spacing={3}>
              {renderEditableField('Rank', 'rank', editedProfile.rank)}
              {renderEditableField('Unit/Organization', 'unit', editedProfile.unit)}
            </Stack>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Additional Information Section */}
      <Box>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            color: '#fff',
            mb: 3,
            fontSize: '1.25rem',
            fontWeight: 600,
            letterSpacing: '0.02em'
          }}
        >
          Additional Information
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <Stack spacing={3}>
              {renderEditableField('Branch of Service', 'branch', editedProfile.branch)}
              {renderEditableField('MOS/Specialty Code', 'mos', editedProfile.mos)}
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack spacing={3}>
              {renderEditableField('Work Email', 'email', editedProfile.email)}
              {renderEditableField('Work Phone', 'phoneNumber', editedProfile.phoneNumber)}
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ProfileDetails;
