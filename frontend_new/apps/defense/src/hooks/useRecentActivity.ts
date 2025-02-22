import { useState, useEffect } from 'react';

export interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user: {
    name: string;
    rank: string;
  };
  status: 'COMPLETED' | 'PENDING' | 'IN PROGRESS' | 'REJECTED';
}

export const useRecentActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, this would be an API call
        // For now, we'll use mock data
        const mockActivities: Activity[] = [
          {
            id: '1',
            type: 'Transfer',
            description: 'M4 Carbine (SN: W123456)',
            user: {
              name: 'Smith',
              rank: 'LT',
            },
            timestamp: new Date().toISOString(),
            status: 'PENDING',
          },
          {
            id: '2',
            type: 'Maintenance',
            description: 'Radio Set (SN: R789012)',
            user: {
              name: 'Jones',
              rank: 'SGT',
            },
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            status: 'IN PROGRESS',
          },
          {
            id: '3',
            type: 'Inspection',
            description: 'Night Vision Device (SN: N345678)',
            user: {
              name: 'Brown',
              rank: 'SSG',
            },
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            status: 'COMPLETED',
          },
          {
            id: '4',
            type: 'Verification',
            description: 'HMMWV (SN: V901234)',
            user: {
              name: 'Wilson',
              rank: 'SPC',
            },
            timestamp: new Date(Date.now() - 259200000).toISOString(),
            status: 'COMPLETED',
          },
          {
            id: '5',
            type: 'Transfer',
            description: 'Generator (SN: G567890)',
            user: {
              name: 'Davis',
              rank: 'CPL',
            },
            timestamp: new Date(Date.now() - 345600000).toISOString(),
            status: 'REJECTED',
          },
        ];

        setActivities(mockActivities);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch activities'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return { activities, isLoading, error };
}; 