import { useState, useEffect } from 'react';
import { wsService } from '../services/websocket';
import { WebSocketMessageType, AssetCountMessage } from '@/types/websocket';
import { ApiResponse } from '@/types/shared';

interface UseActiveAssetsCountReturn {
  count: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useActiveAssetsCount = (): UseActiveAssetsCountReturn => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCount = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/assets/active/count');
      
      if (!response.ok) {
        throw new Error('Failed to fetch active assets count');
      }

      const data: ApiResponse<{ count: number }> = await response.json();
      if (data.success && data.data) {
        setCount(data.data.count);
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to fetch count');
      }
    } catch (err) {
      setError('Error loading active assets count');
      console.error('Error fetching active assets count:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();

    const handleUpdate = (data: AssetCountMessage['payload']) => {
      setCount(data.count);
    };

    wsService.subscribe(WebSocketMessageType.AssetCountUpdate, handleUpdate);

    return () => {
      wsService.unsubscribe(WebSocketMessageType.AssetCountUpdate, handleUpdate);
    };
  }, []);

  return {
    count,
    loading,
    error,
    refresh: fetchCount
  };
}; 