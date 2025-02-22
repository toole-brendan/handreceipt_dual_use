import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Map as MapIcon } from '@mui/icons-material';

const SupplyChainMapCard: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Supply Chain Map
        </Typography>
        <Box
          sx={{
            height: 300,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'action.hover',
            borderRadius: 1,
          }}
        >
          <MapIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Supply Chain Map visualization will be implemented here.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            (Will integrate with Mapbox/Google Maps for real-time shipment tracking)
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SupplyChainMapCard;
