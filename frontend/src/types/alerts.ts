export interface Alert {
  id: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  source?: string;
  acknowledged?: boolean;
  details?: Record<string, unknown>;
}
