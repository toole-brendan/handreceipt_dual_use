import React, { useMemo } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import LocationForm, { LocationFormData } from '@/components/locations/LocationForm';
import DashboardCard from '@/components/common/DashboardCard';
import { getLocationById } from '@/mocks/api/pharmaceuticals-locations.mock';
import { ROUTES } from '@/constants/routes';

const EditLocationPage: React.FC = () => {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();

  const location = useMemo(() => getLocationById(id), [id]);

  const initialData: Partial<LocationFormData> | undefined = useMemo(() => {
    if (!location) return undefined;

    return {
      name: location.name,
      type: location.type,
      address: location.address,
      capacity: {
        total: location.capacity.total.toString(),
        used: location.capacity.used.toString(),
        unit: location.capacity.unit,
      },
      temperature: {
        min: location.temperature.min.toString(),
        max: location.temperature.max.toString(),
        unit: location.temperature.unit,
      },
      humidity: {
        min: location.humidity.min.toString(),
        max: location.humidity.max.toString(),
      },
      certifications: [...location.certifications],
      status: location.status,
      securityLevel: location.securityLevel,
    };
  }, [location]);

  const handleSubmit = async (data: LocationFormData) => {
    try {
      // In a real app, this would make an API call to update the location
      // and create a blockchain transaction for the update
      console.log('Updating location:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate a blockchain transaction hash
      const transactionHash = `0x${Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)).join('')}`;

      console.log('Blockchain transaction created:', transactionHash);

      // Navigate back to locations page
      navigate(ROUTES.INVENTORY.LOCATIONS.ROOT);
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.INVENTORY.LOCATIONS.ROOT);
  };

  if (!location) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Location not found. The location you're trying to edit may have been deleted or moved.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Edit Location: {location.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Update location details. All changes are recorded on the blockchain for transparent tracking and verification.
      </Typography>
      
      <DashboardCard title="Location Details">
        <Box sx={{ p: 2 }}>
          <LocationForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isEdit
          />
        </Box>
      </DashboardCard>
    </Box>
  );
};

export default EditLocationPage;
