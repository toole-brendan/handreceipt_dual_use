import type { PropertyStatus } from '../types/property';
import type { StatusType } from '@shared/components/common/mui/StatusChip';

export const mapPropertyStatusToChipStatus = (status: PropertyStatus): StatusType => {
  switch (status) {
    case 'FMC':
      return 'verified';
    case 'PMC':
      return 'pending';
    case 'NMC':
      return 'sensitive';
    default:
      return 'inactive';
  }
};

export const getStatusLabel = (status: PropertyStatus): string => {
  switch (status) {
    case 'FMC':
      return 'Fully Mission Capable';
    case 'PMC':
      return 'Partially Mission Capable';
    case 'NMC':
      return 'Not Mission Capable';
    default:
      return status;
  }
};
