import { useState, useEffect } from 'react';

export interface PersonnelStats {
  totalPersonnel: number;
  fullyEquipped: number;
  partiallyEquipped: number;
  overdueItems: number;
  equipmentStatus: {
    percentage: number;
    color: 'success' | 'warning' | 'error';
  };
}

export const usePersonnelStats = () => {
  const [personnelStats, setPersonnelStats] = useState<PersonnelStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPersonnelStats = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, this would be an API call
        // For now, we'll use mock data
        const mockStats: PersonnelStats = {
          totalPersonnel: 150,
          fullyEquipped: 120,
          partiallyEquipped: 25,
          overdueItems: 5,
          equipmentStatus: {
            percentage: Math.round((120 / 150) * 100),
            color: 'success',
          },
        };

        setPersonnelStats(mockStats);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch personnel stats'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonnelStats();
  }, []);

  return { personnelStats, isLoading, error };
}; 