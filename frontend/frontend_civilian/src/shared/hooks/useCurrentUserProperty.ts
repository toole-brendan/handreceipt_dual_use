import { useState } from 'react';
import { Property } from '../../types/property';

interface UseCurrentUserPropertyResult {
  property: Property[];
  loading: boolean;
  error: Error | null;
}

export const useCurrentUserProperty = (): UseCurrentUserPropertyResult => {
  const [property] = useState<Property[]>([]);
  const [loading] = useState(false);
  const [error] = useState<Error | null>(null);

  return {
    property,
    loading,
    error
  };
};
