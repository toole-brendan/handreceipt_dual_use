import React from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InventoryIcon from '@mui/icons-material/Inventory';
import QrCodeIcon from '@mui/icons-material/QrCode';

const QuickLinkButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
  textAlign: 'center',
  '& .MuiSvgIcon-root': {
    fontSize: '2rem',
  },
}));

interface QuickLink {
  icon: React.ReactNode;
  label: string;
  description: string;
  href: string;
}

const quickLinks: QuickLink[] = [
  {
    icon: <SwapHorizIcon />,
    label: 'Initiate Transfer',
    description: 'Start a new property transfer',
    href: '/transfers/new',
  },
  {
    icon: <AssessmentIcon />,
    label: 'Generate Report',
    description: 'Create inventory or audit reports',
    href: '/reports/new',
  },
  {
    icon: <InventoryIcon />,
    label: 'View Inventory',
    description: 'Check current unit inventory',
    href: '/inventory',
  },
  {
    icon: <QrCodeIcon />,
    label: 'Scan QR Code',
    description: 'Scan item for quick access',
    href: '/scan',
  },
];

export const QuickLinks: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Quick Links
      </Typography>
      <Grid container spacing={3}>
        {quickLinks.map((link, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <QuickLinkButton
              variant="outlined"
              color="primary"
              fullWidth
              href={link.href}
            >
              {link.icon}
              <Typography variant="subtitle1" component="div">
                {link.label}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {link.description}
              </Typography>
            </QuickLinkButton>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}; 