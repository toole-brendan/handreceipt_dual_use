/**
 * Formatting utilities for strings, numbers, and other data types
 */

/**
 * Options for number formatting
 */
export interface NumberFormatOptions {
  /** Minimum number of decimal places */
  minimumFractionDigits?: number;
  /** Maximum number of decimal places */
  maximumFractionDigits?: number;
  /** Whether to use grouping separators (e.g., thousands) */
  useGrouping?: boolean;
  /** The currency to use in currency formatting */
  currency?: string;
  /** The locale to use for formatting */
  locale?: string;
}

/**
 * Format a number as currency
 * @param value - The number to format
 * @param options - Formatting options
 */
export function formatCurrency(
  value: number,
  options: NumberFormatOptions = {}
): string {
  const {
    currency = 'USD',
    locale = 'en-US',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    useGrouping = true
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping
  }).format(value);
}

/**
 * Format a number with specified decimal places
 * @param value - The number to format
 * @param options - Formatting options
 */
export function formatNumber(
  value: number,
  options: NumberFormatOptions = {}
): string {
  const {
    locale = 'en-US',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    useGrouping = true
  } = options;

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping
  }).format(value);
}

/**
 * Format a number as a percentage
 * @param value - The number to format (0-1)
 * @param options - Formatting options
 */
export function formatPercent(
  value: number,
  options: NumberFormatOptions = {}
): string {
  const {
    locale = 'en-US',
    minimumFractionDigits = 0,
    maximumFractionDigits = 1,
    useGrouping = false
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping
  }).format(value);
}

/**
 * Format a file size in bytes to a human-readable string
 * @param bytes - The size in bytes
 * @param decimals - Number of decimal places to show
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Truncate a string to a maximum length with ellipsis
 * @param str - The string to truncate
 * @param maxLength - Maximum length before truncation
 * @param ellipsis - The string to use as ellipsis
 */
export function truncateString(
  str: string,
  maxLength: number,
  ellipsis = '...'
): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Convert a string to title case
 * @param str - The string to convert
 */
export function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    txt => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
  );
}

/**
 * Convert a string to sentence case
 * @param str - The string to convert
 */
export function toSentenceCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert a camelCase string to Title Case
 * @param str - The camelCase string to convert
 */
export function camelToTitleCase(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Convert a string to kebab-case
 * @param str - The string to convert
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert a string to snake_case
 * @param str - The string to convert
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Strip HTML tags from a string
 * @param str - The string containing HTML
 */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Format a phone number to a standard format
 * @param phone - The phone number to format
 * @param format - The format to use (default: (xxx) xxx-xxxx)
 */
export function formatPhoneNumber(
  phone: string,
  format = '(xxx) xxx-xxxx'
): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return format
      .replace('xxx', match[1])
      .replace('xxx', match[2])
      .replace('xxxx', match[3]);
  }

  return phone;
}

/**
 * Format a string as an identifier (lowercase, no spaces)
 * @param str - The string to format
 */
export function formatIdentifier(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}
