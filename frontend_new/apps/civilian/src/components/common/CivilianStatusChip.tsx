import React from 'react';
import { Chip, ChipProps, styled } from '@mui/material';
import { BasePropertyStatus } from '@shared/types/property/base';

export interface CivilianStatusChipProps extends Omit<ChipProps, 'color'> {
  status: BasePropertyStatus;
  label?: string;
}

const getStatusColor = (status: BasePropertyStatus): string => {
  switch (status) {
    case 'SERVICEABLE':
      return '#4CAF50';  // Success green
    case 'UNSERVICEABLE':
      return '#FF3B3B';  // Error red
    case 'DESTROYED':
      return '#FF3B3B';  // Error red
    case 'MISSING':
      return '#FFD700';  // Warning amber
    case 'IN_TRANSIT':
      return '#2196F3';  // Info blue
    default:
      return 'rgba(255, 255, 255, 0.7)';  // Neutral
  }
};

const StyledChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'status',
})<CivilianStatusChipProps>(({ status, theme }) => {
  const statusColor = getStatusColor(status);
  
  return {
    backgroundColor: theme.palette.background.paper,
    color: statusColor,
    borderRadius: '4px',
    border: `1px solid ${statusColor}`,
    height: '24px',
    
    '& .MuiChip-label': {
      padding: '0 12px',
      fontSize: '0.75rem',
      fontWeight: 500,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
    
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
  };
});

export const CivilianStatusChip = React.forwardRef<HTMLDivElement, CivilianStatusChipProps>((props, ref) => {
  return <StyledChip ref={ref} {...props} />;
});

CivilianStatusChip.displayName = 'CivilianStatusChip';
