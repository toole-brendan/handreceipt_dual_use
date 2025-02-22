import React from 'react';
import { Card, CardContent, Typography, Button, Stack } from '@mui/material';
import {
  QrCodeScanner as ScanIcon,
  AddCircleOutline as CreateIcon,
  SmartToy as SmartContractIcon,
  CloudUpload as ImportIcon
} from '@mui/icons-material';

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: 'primary' | 'secondary' | 'success' | 'info';
}

const QuickActionsCard: React.FC = () => {
  const handleScanQR = () => {
    console.log('Scan QR Code clicked');
    // TODO: Implement QR scanner functionality
  };

  const handleCreateOrder = () => {
    console.log('Create New Order clicked');
    // TODO: Implement order creation
  };

  const handleGenerateContract = () => {
    console.log('Generate Smart Contract clicked');
    // TODO: Implement smart contract generation
  };

  const handleBulkImport = () => {
    console.log('Bulk Import clicked');
    // TODO: Implement bulk import functionality
  };

  const actions: QuickAction[] = [
    {
      label: 'Scan QR Code',
      icon: <ScanIcon />,
      onClick: handleScanQR,
      color: 'primary'
    },
    {
      label: 'Create New Order',
      icon: <CreateIcon />,
      onClick: handleCreateOrder,
      color: 'success'
    },
    {
      label: 'Generate Smart Contract',
      icon: <SmartContractIcon />,
      onClick: handleGenerateContract,
      color: 'info'
    },
    {
      label: 'Bulk Import',
      icon: <ImportIcon />,
      onClick: handleBulkImport,
      color: 'secondary'
    }
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Stack spacing={2}>
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="contained"
              color={action.color || 'primary'}
              startIcon={action.icon}
              onClick={action.onClick}
              fullWidth
              sx={{
                py: 1.5,
                justifyContent: 'flex-start',
                '& .MuiButton-startIcon': {
                  ml: 1
                }
              }}
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
