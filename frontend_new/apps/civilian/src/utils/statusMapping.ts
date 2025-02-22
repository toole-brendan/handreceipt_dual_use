import { BasePropertyStatus } from '@shared/types/property/base';

export const mapPropertyStatusToChipStatus = (status: BasePropertyStatus): 'success' | 'warning' | 'error' | 'info' => {
  switch (status) {
    case 'SERVICEABLE':
      return 'success';
    case 'UNSERVICEABLE':
      return 'error';
    case 'DESTROYED':
      return 'error';
    case 'MISSING':
      return 'warning';
    case 'IN_TRANSIT':
      return 'info';
    default:
      return 'info';
  }
};

export const getStatusLabel = (status: BasePropertyStatus): string => {
  return status.toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
