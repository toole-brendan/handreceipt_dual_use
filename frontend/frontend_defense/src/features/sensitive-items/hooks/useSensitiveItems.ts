import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store/store';
import { SensitiveItem as GlobalSensitiveItem, VerificationStatus } from '@/types/property';

interface SensitiveItemFilters {
  category: string;
  location: string;
  serialNumber: string;
}

interface LocalSensitiveItem {
  id: string;
  name: string;
  serialNumber: string;
  category: string;
  lastVerification: string;
  nextVerification: string;
  location: string;
  status: 'verified' | 'needs_verification' | 'overdue';
  assignedTo?: string;
  verifiedBy?: string;
}

// Helper to convert status to VerificationStatus
const normalizeVerificationStatus = (status: string): VerificationStatus => {
  switch (status.toLowerCase()) {
    case 'verified':
      return 'VERIFIED';
    case 'needs_verification':
      return 'NEEDS_VERIFICATION';
    case 'overdue':
      return 'OVERDUE';
    default:
      return 'IN_PROGRESS';
  }
};

// Helper to convert local format to global format
const convertToGlobalFormat = (item: LocalSensitiveItem): GlobalSensitiveItem => {
  return {
    id: item.id,
    name: item.name,
    serialNumber: item.serialNumber,
    category: item.category,
    location: item.location,
    isSensitive: true,
    status: 'SERVICEABLE',
    value: 0, // Required by Property interface
    createdAt: new Date().toISOString(), // Required by Property interface
    updatedAt: new Date().toISOString(), // Required by Property interface
    verificationSchedule: {
      frequency: 'DAILY',
      lastVerification: item.lastVerification,
      nextVerification: item.nextVerification,
      verifiedBy: item.verifiedBy
    },
    verificationStatus: normalizeVerificationStatus(item.status),
    securityLevel: 'SECRET',
    assignedTo: item.assignedTo
  };
};

// Type guard to check if an item matches the local format
const isLocalSensitiveItem = (item: unknown): item is LocalSensitiveItem => {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'name' in item &&
    'serialNumber' in item &&
    'category' in item &&
    'lastVerification' in item &&
    'nextVerification' in item &&
    'location' in item &&
    'status' in item
  );
};

// Type guard to check if an item matches the global format
const isGlobalSensitiveItem = (item: unknown): item is GlobalSensitiveItem => {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'name' in item &&
    'serialNumber' in item &&
    'category' in item &&
    'isSensitive' in item &&
    item.isSensitive === true &&
    'verificationSchedule' in item &&
    'securityLevel' in item
  );
};

// Memoized base selectors
const selectSensitiveItems = (state: RootState) => {
  const items = state.sensitiveItems?.items || [];
  return items.map(item => {
    if (isLocalSensitiveItem(item)) {
      return convertToGlobalFormat(item);
    }
    if (isGlobalSensitiveItem(item)) {
      return item;
    }
    return null;
  }).filter((item): item is GlobalSensitiveItem => item !== null);
};

// Memoized derived selectors
export const selectSensitiveItemsDueForVerification = createSelector(
  selectSensitiveItems,
  (items) => items.filter(item => item.verificationStatus === 'NEEDS_VERIFICATION')
);

// Custom hooks
export const useSensitiveItems = () => {
  const items = useSelector(selectSensitiveItems);
  const [filters, setFilters] = useState<SensitiveItemFilters>({
    category: '',
    location: '',
    serialNumber: ''
  });

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = !filters.category || item.category === filters.category;
      const matchesLocation = !filters.location || item.location === filters.location;
      const matchesSerial = !filters.serialNumber || 
        item.serialNumber.toLowerCase().includes(filters.serialNumber.toLowerCase());
      
      return matchesCategory && matchesLocation && matchesSerial;
    });
  }, [items, filters]);

  return {
    items,
    filteredItems,
    filters,
    setFilters
  };
};

export const useSensitiveItemsDueForVerification = () => 
  useSelector(selectSensitiveItemsDueForVerification);
