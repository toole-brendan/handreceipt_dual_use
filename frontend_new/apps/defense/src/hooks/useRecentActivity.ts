import { useState, useEffect } from 'react';

export interface Activity {
  id: string;
  type: 'transfer' | 'maintenance' | 'inspection' | 'verification';
  item: {
    name: string;
    serialNumber: string;
  };
  personnel: {
    name: string;
    rank: string;
  };
  date: string;
  status: 'pending' | 'completed' | 'rejected' | 'in_progress';
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
            type: 'transfer',
            item: {
              name: 'M4 Carbine',
              serialNumber: 'W123456',
            },
            personnel: {
              name: 'Smith',
              rank: 'LT',
            },
            date: new Date().toISOString(),
            status: 'pending',
          },
          {
            id: '2',
            type: 'maintenance',
            item: {
              name: 'Radio Set',
              serialNumber: 'R789012',
            },
            personnel: {
              name: 'Jones',
              rank: 'SGT',
            },
            date: new Date(Date.now() - 86400000).toISOString(),
            status: 'in_progress',
          },
          {
            id: '3',
            type: 'inspection',
            item: {
              name: 'Night Vision Device',
              serialNumber: 'N345678',
            },
            personnel: {
              name: 'Brown',
              rank: 'SSG',
            },
            date: new Date(Date.now() - 172800000).toISOString(),
            status: 'completed',
          },
          {
            id: '4',
            type: 'verification',
            item: {
              name: 'HMMWV',
              serialNumber: 'V901234',
            },
            personnel: {
              name: 'Wilson',
              rank: 'SPC',
            },
            date: new Date(Date.now() - 259200000).toISOString(),
            status: 'completed',
          },
          {
            id: '5',
            type: 'transfer',
            item: {
              name: 'Generator',
              serialNumber: 'G567890',
            },
            personnel: {
              name: 'Davis',
              rank: 'CPL',
            },
            date: new Date(Date.now() - 345600000).toISOString(),
            status: 'rejected',
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