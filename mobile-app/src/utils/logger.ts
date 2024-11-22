type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  error?: Error;
}

export class Logger {
  private static readonly MAX_LOG_SIZE = 1000;
  private static logs: LogEntry[] = [];

  static debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  static info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  static warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  static error(message: string, error?: Error, data?: any): void {
    this.log('error', message, data, error);
  }

  private static log(
    level: LogLevel,
    message: string,
    data?: any,
    error?: Error
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      error
    };

    this.logs.push(entry);
    this.trimLogs();
    this.persistLog(entry);
    
    // Also log to console in development
    if (__DEV__) {
      console[level](message, { data, error });
    }
  }

  private static trimLogs(): void {
    if (this.logs.length > this.MAX_LOG_SIZE) {
      this.logs = this.logs.slice(-this.MAX_LOG_SIZE);
    }
  }

  private static async persistLog(entry: LogEntry): Promise<void> {
    // Implement log persistence (e.g., to file or remote logging service)
    // This is a placeholder for actual implementation
  }

  static async getLogs(
    level?: LogLevel,
    limit: number = 100
  ): Promise<LogEntry[]> {
    let filteredLogs = this.logs;
    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    return filteredLogs.slice(-limit);
  }

  static async clearLogs(): Promise<void> {
    this.logs = [];
    // Clear persisted logs as well
  }
}
