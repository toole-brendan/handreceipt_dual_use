import { useState, useEffect } from 'react';

export interface Notification {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  link?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, this would be an API call
        // For now, we'll use mock data
        const mockNotifications: Notification[] = [
          {
            id: '1',
            type: 'critical',
            message: 'M4 Carbine (SN: 123456) is overdue for maintenance',
            timestamp: new Date().toISOString(),
            link: '/maintenance/123456',
          },
          {
            id: '2',
            type: 'warning',
            message: 'Low stock alert: Night Vision Devices (5 remaining)',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            link: '/inventory/nvg',
          },
          {
            id: '3',
            type: 'info',
            message: 'New transfer request from LT Smith',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            link: '/transfers/pending',
          },
          {
            id: '4',
            type: 'warning',
            message: 'Monthly sensitive items inventory due in 2 days',
            timestamp: new Date(Date.now() - 14400000).toISOString(),
            link: '/inventory/sensitive',
          },
          {
            id: '5',
            type: 'info',
            message: 'System maintenance scheduled for tonight at 2200',
            timestamp: new Date(Date.now() - 28800000).toISOString(),
          },
        ];

        setNotifications(mockNotifications);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch notifications'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return { notifications, isLoading, error };
}; 