// Export base types
export type {
  BasePropertyStatus as PropertyStatus,
  BaseVerificationStatus as VerificationStatus,
  BaseProperty as Property,
  BasePropertyTransfer as PropertyTransfer,
  BaseSensitiveItem as SensitiveItem,
  BaseVerification as Verification,
  BasePropertyFilters as PropertyFilters,
  BasePropertyStats as PropertyStats,
} from './base';

// Export civilian types
export type {
  CivilianProperty,
  CivilianPropertyTransfer,
  CivilianSensitiveItem,
  CivilianVerification,
  CivilianPropertyFilters,
  CivilianPropertyStats,
} from './civilian';

// Export defense types
export type {
  DefenseProperty,
  DefensePropertyTransfer,
  DefenseSensitiveItem,
  DefenseVerification,
  DefensePropertyFilters,
  DefensePropertyStats,
} from './defense';

// Re-export specific types with more descriptive names
export type { CivilianProperty as OrganizationalProperty } from './civilian';
export type { DefenseProperty as MilitaryProperty } from './defense';

// Re-export common property types
export type { BaseProperty as CommonProperty } from './base';
export type { BasePropertyTransfer as CommonPropertyTransfer } from './base';
export type { BaseSensitiveItem as CommonSensitiveItem } from './base';
export type { BaseVerification as CommonVerification } from './base';
