import { useState, useEffect } from 'react';

interface AnalyticsDataPoint {
  time: string;
  utilization: number;
  performance: number;
  efficiency: number;
  throughput: number;
}

interface UseAnalyticsDataReturn {
  data: AnalyticsDataPoint[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useAnalyticsData = (): UseAnalyticsDataReturn => {
  const [data, setData] = useState<AnalyticsDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/operational');
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const result = await response.json();
      setData(result.data);
      setError(null);
    } catch (err) {
      setError('Error loading analytics data');
      console.error('Error fetching analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  return {
    data,
    loading,
    error,
    refresh: fetchData
  };
}; 