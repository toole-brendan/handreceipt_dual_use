import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from 'recharts';
import { BarChart, RefreshCw } from 'lucide-react';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import '@/ui/styles/components/dashboard/analytics.css';

const Analytics: React.FC = () => {
  const { data, loading, error, refresh } = useAnalyticsData();

  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatTooltip = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="analytics">
      <div className="analytics__header">
        <div className="analytics__title-group">
          <BarChart 
            className="analytics__icon" 
            size={20}
            aria-hidden="true"
          />
          <h3 className="analytics__title">Operational Analytics</h3>
        </div>
        <button 
          className="analytics__refresh"
          onClick={refresh}
          aria-label="Refresh analytics"
        >
          <RefreshCw 
            size={16} 
            className={loading ? 'spinning' : ''} 
          />
        </button>
      </div>

      <div className="analytics__content">
        {loading ? (
          <div className="analytics__loading" role="status">
            <RefreshCw className="analytics__loading-icon" />
            <span>Loading analytics data...</span>
          </div>
        ) : error ? (
          <div className="analytics__error" role="alert">
            {error}
          </div>
        ) : (
          <div className="analytics__chart">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tickFormatter={formatTime}
                  stroke="var(--color-text-secondary)"
                />
                <YAxis 
                  stroke="var(--color-text-secondary)"
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={formatTooltip}
                  contentStyle={{
                    background: 'var(--color-background-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--border-radius-sm)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="utilization" 
                  stroke="var(--color-primary)" 
                  name="Utilization"
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="performance" 
                  stroke="var(--color-success)" 
                  name="Performance"
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="var(--color-warning)" 
                  name="Efficiency"
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="throughput" 
                  stroke="var(--color-info)" 
                  name="Throughput"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics; 