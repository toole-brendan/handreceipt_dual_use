import { useState, useEffect } from 'react';

interface Activity {
  id: string;
  timestamp: string;
  description: string;
  type: 'info' | 'warning' | 'error' | 'success';
  user?: string;
  details?: string;
}

interface UseRecentActivityReturn {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useRecentActivity = (): UseRecentActivityReturn => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/activities/recent');
      
      if (!response.ok) {
        throw new Error('Failed to fetch recent activities');
      }

      const data = await response.json();
      setActivities(data.activities);
      setError(null);
    } catch (err) {
      setError('Error loading recent activities');
      console.error('Error fetching recent activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return {
    activities,
    loading,
    error,
    refresh: fetchActivities
  };
}; 