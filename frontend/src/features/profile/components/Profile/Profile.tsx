import React, { useState } from 'react';
import { Box, Tabs, Tab, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { UserProfile } from '../../../../types/user';
import ProfileDetails from '../ProfileDetails';
import SecuritySettings from '../SecuritySettings';
import { ActivityLog } from '../ActivityLog';
import { ArrowLeft } from 'lucide-react';

// Mock data
const mockProfile: UserProfile = {
  id: 'usr_7f4c9b2d',
  username: 'CPT.ANDERSON.JAMES.A',
  firstName: 'James',
  lastName: 'Anderson',
  email: 'james.anderson@mail.mil',
  phoneNumber: '(910) 555-0122',
  profileImage: '/assets/profile/default-officer.png',
  
  // Military Information
  rank: 'CPT',
  unit: '2nd Battalion, 325th Airborne Infantry Regiment',
  branch: 'Army',
  mos: '11A - Infantry Officer',
  dodId: '1234567890',
  role: 'OFFICER',
  classification: 'SECRET',
  
  // System Access & Permissions
  permissions: [
    'ASSET_MANAGEMENT',
    'PERSONNEL_VIEW',
    'TRANSFER_APPROVE',
    'INVENTORY_FULL',
    'REPORTS_GENERATE'
  ],
  
  lastLogin: new Date().toISOString(),
  
  preferences: {
    theme: 'dark',
    language: 'en-US',
    timezone: 'America/New_York',
    dateFormat: 'DD MMM YYYY',
    notifications: {
      email: true,
      push: true,
      transferRequests: true,
      securityAlerts: true,
      systemUpdates: true,
      assetChanges: true,
    },
  },
};

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box className="profile-container" sx={{ p: 3 }}>
      {/* Back to My Property Button */}
      <Box sx={{ mb: 4 }}>
        <Button
          component={Link}
          to="/property"
          startIcon={<ArrowLeft size={20} />}
          variant="outlined"
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            '&:hover': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
            textTransform: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          Back to My Property
        </Button>
      </Box>

      {/* Profile Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#fff' }}>
          {mockProfile.rank} {mockProfile.firstName} {mockProfile.lastName}
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.1)', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              minHeight: 48,
              '&.Mui-selected': {
                color: '#fff',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#fff',
            },
          }}
        >
          <Tab label="Profile Details" />
          <Tab label="Security" />
          <Tab label="Activity Log" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box className="profile-content">
        {activeTab === 0 && <ProfileDetails profile={mockProfile} />}
        {activeTab === 1 && <SecuritySettings profile={mockProfile} />}
        {activeTab === 2 && <ActivityLog userId={mockProfile.id} />}
      </Box>
    </Box>
  );
};

export default Profile;
