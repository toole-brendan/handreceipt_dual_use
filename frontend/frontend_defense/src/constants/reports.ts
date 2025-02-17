export const REPORT_TYPES = {
  INVENTORY: 'inventory',
  AUDIT: 'audit',
  TRANSFER: 'transfer',
  MAINTENANCE: 'maintenance',
  VERIFICATION: 'verification',
} as const

export const REPORT_FORMATS = {
  PDF: 'pdf',
  CSV: 'csv',
  EXCEL: 'xlsx',
} as const

export const REPORT_PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
  CUSTOM: 'custom',
} as const

export type ReportType = typeof REPORT_TYPES[keyof typeof REPORT_TYPES]
export type ReportFormat = typeof REPORT_FORMATS[keyof typeof REPORT_FORMATS]
export type ReportPeriod = typeof REPORT_PERIODS[keyof typeof REPORT_PERIODS]

export interface ReportConfig {
  type: ReportType
  format: ReportFormat
  period: ReportPeriod
  startDate?: Date
  endDate?: Date
  filters?: Record<string, unknown>
}
