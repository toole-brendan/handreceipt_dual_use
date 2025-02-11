import React from 'react';
import { Box, Container, Typography, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import PersonnelCard from '@/features/personnel/components/cards/PersonnelCard';
import AssignedItemsTable from '@/features/personnel/components/tables/AssignedItemsTable';
import { usePersonnelData } from '@/features/personnel/hooks/usePersonnelData';
import { usePersonnelActions } from '@/features/personnel/hooks/usePersonnelActions';

const PersonnelDashboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { personnel, isLoading, error } = usePersonnelData(id || '');
  const { 
    generateHandReceipt,
    initiateTransfer,
    viewProfile
  } = usePersonnelActions();
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (isLoading || !personnel) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Pass the personnel data directly since it already matches the Personnel interface
  const soldierData = personnel;

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h4">
              Personnel Management
            </Typography>
          </Box>
        </Box>

        <PersonnelCard 
          personnel={soldierData}
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
          onHandReceipt={generateHandReceipt}
          onViewProfile={viewProfile}
          onTransferEquipment={(equipmentId) => initiateTransfer(personnel.id, [equipmentId])}
          onViewEquipmentDetails={(equipmentId) => {
            // TODO: Implement equipment details view
            console.log('View equipment details:', equipmentId);
          }}
        />
        
        <AssignedItemsTable 
          equipment={soldierData.assignedProperty}
          onTransfer={(equipmentId) => initiateTransfer(personnel.id, [equipmentId])}
          onViewDetails={(equipmentId) => {
            // TODO: Implement equipment details view
            console.log('View equipment details:', equipmentId);
          }}
        />
      </Box>
    </Container>
  );
};

export default PersonnelDashboardPage;
