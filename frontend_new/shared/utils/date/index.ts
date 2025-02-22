/**
 * Date formatting and manipulation utilities
 */

/**
 * Options for date formatting
 */
export interface DateFormatOptions {
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
}

/**
 * Formats a date string into a localized date string
 * @param date - Date string or Date object to format
 * @param options - Optional formatting options
 * @returns Formatted date string
 */
export function formatDate(date: string | Date, options: DateFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
}): string {
  return new Date(date).toLocaleDateString(undefined, options);
}

/**
 * Formats a date into a relative time string (e.g., "2h ago")
 * @param date - Date string or Date object to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y ago`;
}

/**
 * Checks if a date is today
 * @param date - Date to check
 * @returns boolean indicating if the date is today
 */
export function isToday(date: Date | string): boolean {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
}

/**
 * Checks if a date is in the past
 * @param date - Date to check
 * @returns boolean indicating if the date is in the past
 */
export function isPast(date: Date | string): boolean {
  return new Date(date).getTime() < new Date().getTime();
}

/**
 * Checks if a date is in the future
 * @param date - Date to check
 * @returns boolean indicating if the date is in the future
 */
export function isFuture(date: Date | string): boolean {
  return new Date(date).getTime() > new Date().getTime();
}

/**
 * Adds days to a date
 * @param date - Starting date
 * @param days - Number of days to add (can be negative)
 * @returns New date with days added
 */
export function addDays(date: Date | string, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Gets the start of a day (midnight)
 * @param date - Date to get start of day for
 * @returns Date object set to start of day
 */
export function startOfDay(date: Date | string): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Gets the end of a day (23:59:59.999)
 * @param date - Date to get end of day for
 * @returns Date object set to end of day
 */
export function endOfDay(date: Date | string): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}
