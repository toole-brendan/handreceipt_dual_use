export * from './base';
export * from './civilian';
export * from './defense';

// Re-export specific types with more descriptive names
export type { BaseUser as User } from './base';
export type { BaseAuthState as AuthState } from './base';
export type { BaseAuthResponse as AuthResponse } from './base';
export type { BaseAuthError as AuthError } from './base';
export type { UserPreferences } from './base';
export type { UserNotificationPreferences } from './base';
