import React from 'react';
import { styled } from '@mui/material';

const EmergencyContainer = styled('div')(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: theme.zIndex.modal,
}));

const EmergencyButton = styled('button')(({ theme }) => ({
  backgroundColor: theme.palette.error.main,
  color: theme.palette.error.contrastText,
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  border: 'none',
  cursor: 'pointer',
  fontWeight: 'bold',
  boxShadow: theme.shadows[2],
  '&:hover': {
    backgroundColor: theme.palette.error.dark,
  },
  '&:focus': {
    outline: `2px solid ${theme.palette.error.light}`,
    outlineOffset: 2,
  },
}));

const EmergencyActions: React.FC = () => {
  return (
    <EmergencyContainer>
      <EmergencyButton>Emergency Logout</EmergencyButton>
    </EmergencyContainer>
  );
};

export default EmergencyActions;
