import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { Security, Person, Notifications } from '@mui/icons-material';

const SettingsPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Defense Settings
      </Typography>

      <Paper sx={{ bgcolor: '#121212', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <List>
          <ListItem button>
            <ListItemIcon>
              <Person sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Profile Settings" 
              secondary="Update your military profile information"
            />
          </ListItem>

          <ListItem button>
            <ListItemIcon>
              <Security sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Security Settings" 
              secondary="Manage security clearance and access controls"
            />
          </ListItem>

          <ListItem button>
            <ListItemIcon>
              <Notifications sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Notification Preferences" 
              secondary="Configure alert and notification settings"
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default SettingsPage;
