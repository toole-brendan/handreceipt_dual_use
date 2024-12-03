import { useState, useEffect } from 'react';
import { PropertyItem } from '@/features/property/types';
import { getPersonnelProperty } from '@/features/property/services/propertyService';

interface UsePersonnelPropertyResult {
  properties: PropertyItem[];
  loading: boolean;
  error: Error | null;
}

export const usePersonnelProperty = (personnelId: string): UsePersonnelPropertyResult => {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const data = await getPersonnelProperty(personnelId);
        setProperties(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch properties'));
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [personnelId]);

  return { properties, loading, error };
};

export default usePersonnelProperty; 