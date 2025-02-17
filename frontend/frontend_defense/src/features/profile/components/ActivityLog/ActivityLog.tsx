import React from 'react';
import { Box, Typography, Stack } from '@mui/material';

interface ActivityLogEntry {
  id: string;
  action: string;
  timestamp: string;
  details: string;
  ipAddress?: string;
}

interface ActivityLogProps {
  userId: string;
}

const mockActivities: ActivityLogEntry[] = [
  {
    id: '1',
    action: 'Property Transfer Initiated',
    timestamp: '2025-02-08T20:15:00Z',
    details: 'Initiated transfer of M4A1 Carbine (SN: W123456) to SGT Johnson',
    ipAddress: '10.23.45.67'
  },
  {
    id: '2',
    action: 'Security Settings Updated',
    timestamp: '2025-02-08T19:30:00Z',
    details: 'Changed password and updated 2FA settings',
    ipAddress: '10.23.45.67'
  },
  {
    id: '3',
    action: 'Inventory Verification',
    timestamp: '2025-02-08T18:45:00Z',
    details: 'Completed monthly sensitive items inventory verification',
    ipAddress: '10.23.45.67'
  },
  {
    id: '4',
    action: 'QR Code Generated',
    timestamp: '2025-02-08T17:20:00Z',
    details: 'Generated new QR code for ACOG Scope (SN: TA31-789012)',
    ipAddress: '10.23.45.67'
  },
  {
    id: '5',
    action: 'System Login',
    timestamp: '2025-02-08T16:00:00Z',
    details: 'Successful login from authorized terminal',
    ipAddress: '10.23.45.67'
  }
];

const ActivityLog: React.FC<ActivityLogProps> = () => {
  return (
    <Stack spacing={3}>
      {mockActivities.map((activity) => (
        <Box
          key={activity.id}
          sx={{
            p: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 1,
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography 
              sx={{ 
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              {activity.action}
            </Typography>
            <Typography 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.75rem'
              }}
            >
              {new Date(activity.timestamp).toLocaleString()}
            </Typography>
          </Box>
          <Typography 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.875rem',
              mb: 1
            }}
          >
            {activity.details}
          </Typography>
          <Typography 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.75rem'
            }}
          >
            IP: {activity.ipAddress}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
};

export default ActivityLog;
