/**
 * Validation utilities for common data formats
 */

/**
 * Email validation options
 */
export interface EmailValidationOptions {
  /** Allow local-part only emails (e.g., 'user' instead of 'user@domain.com') */
  allowLocalOnly?: boolean;
  /** Maximum length of the email address */
  maxLength?: number;
  /** Allowed domains (e.g., ['company.com', 'org.com']) */
  allowedDomains?: string[];
}

/**
 * Phone number validation options
 */
export interface PhoneValidationOptions {
  /** Allow international numbers */
  allowInternational?: boolean;
  /** Required country code */
  countryCode?: string;
  /** Allow extensions */
  allowExtensions?: boolean;
}

/**
 * Password validation options
 */
export interface PasswordValidationOptions {
  /** Minimum length requirement */
  minLength?: number;
  /** Maximum length requirement */
  maxLength?: number;
  /** Require uppercase letters */
  requireUppercase?: boolean;
  /** Require lowercase letters */
  requireLowercase?: boolean;
  /** Require numbers */
  requireNumbers?: boolean;
  /** Require special characters */
  requireSpecial?: boolean;
  /** Custom regex pattern */
  pattern?: RegExp;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  /** Error message if validation failed */
  error?: string;
  /** Additional validation details */
  details?: Record<string, boolean>;
}

/**
 * Validate an email address
 */
export function validateEmail(
  email: string,
  options: EmailValidationOptions = {}
): ValidationResult {
  const {
    allowLocalOnly = false,
    maxLength = 254,
    allowedDomains = []
  } = options;

  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  if (email.length > maxLength) {
    return { isValid: false, error: `Email must be no longer than ${maxLength} characters` };
  }

  // Basic email regex pattern
  const emailPattern = allowLocalOnly
    ? /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)?$/
    : /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailPattern.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  if (allowedDomains.length > 0) {
    const domain = email.split('@')[1];
    if (!allowedDomains.some(d => domain?.endsWith(d))) {
      return { isValid: false, error: 'Email domain not allowed' };
    }
  }

  return { isValid: true };
}

/**
 * Validate a phone number
 */
export function validatePhone(
  phone: string,
  options: PhoneValidationOptions = {}
): ValidationResult {
  const {
    allowInternational = false,
    countryCode = '',
    allowExtensions = false
  } = options;

  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove all non-numeric characters except + for international
  const cleaned = phone.replace(/[^\d+]/g, '');

  if (allowInternational) {
    // International phone number pattern
    const pattern = /^\+?[\d]{10,15}(?:x\d{1,6})?$/;
    if (!pattern.test(cleaned)) {
      return { isValid: false, error: 'Invalid international phone number format' };
    }
  } else {
    // US phone number pattern
    const pattern = allowExtensions
      ? /^\d{10}(?:x\d{1,6})?$/
      : /^\d{10}$/;
    if (!pattern.test(cleaned)) {
      return { isValid: false, error: 'Invalid phone number format' };
    }
  }

  if (countryCode && !phone.startsWith(countryCode)) {
    return { isValid: false, error: `Phone number must start with ${countryCode}` };
  }

  return { isValid: true };
}

/**
 * Validate a password
 */
export function validatePassword(
  password: string,
  options: PasswordValidationOptions = {}
): ValidationResult {
  const {
    minLength = 8,
    maxLength = 128,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecial = true,
    pattern
  } = options;

  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  const details: Record<string, boolean> = {
    hasMinLength: password.length >= minLength,
    hasMaxLength: password.length <= maxLength,
    hasUppercase: requireUppercase ? /[A-Z]/.test(password) : true,
    hasLowercase: requireLowercase ? /[a-z]/.test(password) : true,
    hasNumbers: requireNumbers ? /\d/.test(password) : true,
    hasSpecial: requireSpecial ? /[!@#$%^&*(),.?":{}|<>]/.test(password) : true,
    matchesPattern: pattern ? pattern.test(password) : true
  };

  const isValid = Object.values(details).every(Boolean);

  if (!isValid) {
    const errors: string[] = [];
    if (!details.hasMinLength) errors.push(`Must be at least ${minLength} characters`);
    if (!details.hasMaxLength) errors.push(`Must be no more than ${maxLength} characters`);
    if (!details.hasUppercase) errors.push('Must include uppercase letters');
    if (!details.hasLowercase) errors.push('Must include lowercase letters');
    if (!details.hasNumbers) errors.push('Must include numbers');
    if (!details.hasSpecial) errors.push('Must include special characters');
    if (!details.matchesPattern) errors.push('Must match required pattern');

    return {
      isValid: false,
      error: errors.join('. '),
      details
    };
  }

  return { isValid: true, details };
}

/**
 * Validate a URL
 */
export function validateUrl(url: string, requireHttps = false): ValidationResult {
  if (!url) {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    const parsed = new URL(url);
    if (requireHttps && parsed.protocol !== 'https:') {
      return { isValid: false, error: 'URL must use HTTPS' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

/**
 * Validate a date string
 */
export function validateDate(
  date: string,
  minDate?: Date,
  maxDate?: Date
): ValidationResult {
  if (!date) {
    return { isValid: false, error: 'Date is required' };
  }

  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }

  if (minDate && parsed < minDate) {
    return { isValid: false, error: `Date must be after ${minDate.toLocaleDateString()}` };
  }

  if (maxDate && parsed > maxDate) {
    return { isValid: false, error: `Date must be before ${maxDate.toLocaleDateString()}` };
  }

  return { isValid: true };
}

/**
 * Validate a credit card number using the Luhn algorithm
 */
export function validateCreditCard(number: string): ValidationResult {
  if (!number) {
    return { isValid: false, error: 'Credit card number is required' };
  }

  const cleaned = number.replace(/\D/g, '');
  if (!/^\d{13,19}$/.test(cleaned)) {
    return { isValid: false, error: 'Invalid credit card number length' };
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return {
    isValid: sum % 10 === 0,
    error: sum % 10 === 0 ? undefined : 'Invalid credit card number'
  };
}

/**
 * Validate a postal code
 */
export function validatePostalCode(
  code: string,
  countryCode = 'US'
): ValidationResult {
  if (!code) {
    return { isValid: false, error: 'Postal code is required' };
  }

  const patterns: Record<string, RegExp> = {
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
    UK: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,
    // Add more country patterns as needed
  };

  const pattern = patterns[countryCode];
  if (!pattern) {
    return { isValid: false, error: 'Unsupported country code' };
  }

  return {
    isValid: pattern.test(code),
    error: pattern.test(code) ? undefined : 'Invalid postal code format'
  };
}
