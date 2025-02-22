import React from 'react';
import { Chip, ChipProps, styled } from '@mui/material';

export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'completed';

export interface OrderStatusChipProps extends Omit<ChipProps, 'color'> {
  status: OrderStatus;
  label?: string;
}

const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case 'processing':
      return '#FFB74D';  // Orange
    case 'shipped':
      return '#64B5F6';  // Blue
    case 'delivered':
      return '#81C784';  // Light green
    case 'completed':
      return '#4CAF50';  // Success green
    default:
      return '#9E9E9E';  // Grey
  }
};

const StyledChip = styled(Chip)<{ statuscolor: string }>(({ statuscolor }) => ({
  backgroundColor: statuscolor,
  color: '#fff',
  '&:hover': {
    backgroundColor: statuscolor,
  },
}));

export const OrderStatusChip: React.FC<OrderStatusChipProps> = ({
  status,
  label,
  ...props
}) => {
  return (
    <StyledChip
      statuscolor={getStatusColor(status)}
      label={label || status.charAt(0).toUpperCase() + status.slice(1)}
      {...props}
    />
  );
}; 