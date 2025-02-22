import { useState, useEffect } from 'react';
import { propertyService } from '../services/propertyService';

interface PropertyStats {
  totalItems: number;
  serviceableItems: number;
  maintenanceNeeded: number;
  overdueItems: number;
  categories: Array<{
    name: string;
    value: number;
    count: number;
  }>;
  criticalItems: Array<{
    name: string;
    issue: string;
    status: 'critical' | 'warning';
  }>;
  pendingTransfers: {
    count: number;
    items: Array<{
      id: string;
      itemName: string;
      from: string;
      to: string;
    }>;
  };
  maintenanceRequests: {
    count: number;
    items: Array<{
      id: string;
      itemName: string;
      type: string;
      priority: 'high' | 'medium' | 'low';
    }>;
  };
}

export const usePropertyStats = () => {
  const [stats, setStats] = useState<PropertyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, this would be an API call
        // For now, we'll use mock data
        const mockStats: PropertyStats = {
          totalItems: 1245,
          serviceableItems: 1145,
          maintenanceNeeded: 52,
          overdueItems: 3,
          categories: [
            { name: 'Weapons', value: 40, count: 498 },
            { name: 'Vehicles', value: 25, count: 311 },
            { name: 'Communication Equipment', value: 20, count: 249 },
            { name: 'Other', value: 15, count: 187 },
          ],
          criticalItems: [
            { name: 'M4 Carbine', issue: 'Low Stock', status: 'critical' },
            { name: 'HMMWV', issue: 'Maintenance Required', status: 'warning' },
            { name: 'Radio Set', issue: 'Overdue Inspection', status: 'critical' },
            { name: 'Night Vision Device', issue: 'Low Battery', status: 'warning' },
          ],
          pendingTransfers: {
            count: 8,
            items: [
              {
                id: '1',
                itemName: 'M4 Carbine',
                from: 'SGT Smith',
                to: 'SPC Johnson',
              },
              {
                id: '2',
                itemName: 'Radio Set',
                from: 'LT Davis',
                to: 'SSG Wilson',
              },
              {
                id: '3',
                itemName: 'Night Vision Device',
                from: 'CPL Brown',
                to: 'PFC Martinez',
              },
            ],
          },
          maintenanceRequests: {
            count: 5,
            items: [
              {
                id: '1',
                itemName: 'HMMWV',
                type: 'Scheduled Maintenance',
                priority: 'high',
              },
              {
                id: '2',
                itemName: 'Generator',
                type: 'Repair',
                priority: 'medium',
              },
              {
                id: '3',
                itemName: 'Radio Set',
                type: 'Calibration',
                priority: 'low',
              },
            ],
          },
        };

        setStats(mockStats);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch property stats'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, isLoading, error };
}; 