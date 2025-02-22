import React from 'react';
import { Chip, ChipProps, styled } from '@mui/material';

export type CivilianChipColor = 'success' | 'warning' | 'error' | 'info';

export interface CivilianChipProps extends Omit<ChipProps, 'color'> {
  color: CivilianChipColor;
}

const getChipColor = (color: CivilianChipColor): string => {
  switch (color) {
    case 'success':
      return '#4CAF50';  // Success green
    case 'warning':
      return '#FFD700';  // Warning amber
    case 'error':
      return '#FF3B3B';  // Error red
    case 'info':
      return '#2196F3';  // Info blue
    default:
      return 'rgba(255, 255, 255, 0.7)';  // Neutral
  }
};

const StyledChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'color',
})<CivilianChipProps>(({ color, theme }) => {
  const chipColor = getChipColor(color);
  
  return {
    backgroundColor: theme.palette.background.paper,
    color: chipColor,
    borderRadius: '4px',
    border: `1px solid ${chipColor}`,
    height: '24px',
    
    '& .MuiChip-label': {
      padding: '0 12px',
      fontSize: '0.75rem',
      fontWeight: 500,
    },
    
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
  };
});

export const CivilianChip = React.forwardRef<HTMLDivElement, CivilianChipProps>((props, ref) => {
  return <StyledChip ref={ref} {...props} />;
});

CivilianChip.displayName = 'CivilianChip';
