import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const PropertyPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Defense Property Management
        </Typography>
        <Typography variant="body1">
          Welcome to the Defense version of the HandReceipt property management system.
        </Typography>
      </Box>
    </Container>
  );
};

export default PropertyPage;
