import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LocationForm, { LocationFormData } from '@/components/locations/LocationForm';
import DashboardCard from '@/components/common/DashboardCard';
import { ROUTES } from '@/constants/routes';

const AddLocationPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: LocationFormData) => {
    try {
      // In a real app, this would make an API call to create the location
      // and create a blockchain transaction for location creation
      console.log('Creating location:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate a blockchain transaction hash
      const transactionHash = `0x${Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)).join('')}`;

      console.log('Blockchain transaction created:', transactionHash);

      // Navigate back to locations page
      navigate(ROUTES.INVENTORY.LOCATIONS.ROOT);
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.INVENTORY.LOCATIONS.ROOT);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Add New Location
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Create a new location in the supply chain network. All locations are registered on the blockchain for transparent tracking and verification.
      </Typography>
      
      <DashboardCard title="Location Details">
        <Box sx={{ p: 2 }}>
          <LocationForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </Box>
      </DashboardCard>
    </Box>
  );
};

export default AddLocationPage;
