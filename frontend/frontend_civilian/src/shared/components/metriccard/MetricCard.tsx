import React from 'react';
import {
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import type { SystemMetric } from '@/shared/hooks/useSystemMetrics';
import '@/styles/components/components/dashboard/metric-card.css';

export interface MetricCardProps {
  metric: SystemMetric;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const getStatusColor = (status: SystemMetric['status']) => {
    const colors = {
      healthy: 'var(--color-success)',
      degraded: 'var(--color-warning)',
      critical: 'var(--color-error)'
    };
    return colors[status] || 'var(--color-text-secondary)';
  };

  const chartData = metric.history.map((h: { value: number }) => ({
    value: h.value
  }));

  return (
    <div className="metric-card">
      <div className="metric-card__header">
        <h4 className="metric-card__title">{metric.name}</h4>
        <span 
          className={`metric-card__status metric-card__status--${metric.status}`}
          role="status"
        >
          {metric.status}
        </span>
      </div>

      <div className="metric-card__value">
        {metric.value}
        <small className="metric-card__unit">{metric.unit}</small>
      </div>

      <div className="metric-card__chart" aria-hidden="true">
        <ResponsiveContainer width="100%" height={20}>
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={getStatusColor(metric.status)}
              dot={false}
              strokeWidth={1}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="metric-card__threshold">
        Threshold: {metric.threshold}{metric.unit}
      </div>
    </div>
  );
};

export default React.memo(MetricCard);
