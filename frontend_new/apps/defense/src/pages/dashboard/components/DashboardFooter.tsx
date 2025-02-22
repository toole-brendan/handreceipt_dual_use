import React from 'react';
import { Box, Link, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const FooterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  marginTop: theme.spacing(4),
}));

const FooterLinks = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
}));

export const DashboardFooter: React.FC = () => {
  return (
    <FooterContainer>
      <Typography variant="body2" color="text.secondary">
        HandReceipt v1.0 | Last Updated: {new Date().toLocaleDateString()}
      </Typography>
      <FooterLinks>
        <Link
          href="/help"
          color="inherit"
          underline="hover"
          variant="body2"
        >
          Help
        </Link>
        <Link
          href="/support"
          color="inherit"
          underline="hover"
          variant="body2"
        >
          Support
        </Link>
        <Link
          href="/privacy"
          color="inherit"
          underline="hover"
          variant="body2"
        >
          Privacy Policy
        </Link>
      </FooterLinks>
    </FooterContainer>
  );
}; 