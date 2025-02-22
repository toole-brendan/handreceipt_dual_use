import { BaseAuthService } from '@shared/services/auth';
import { BasePropertyService } from '@shared/services/property';
import type { DefenseUser } from '@shared/types/auth/defense';

/**
 * Defense-specific authentication service
 */
export class DefenseAuthService extends BaseAuthService {
  constructor() {
    super('/api/defense/auth');
  }

  async getCurrentUser(): Promise<DefenseUser> {
    return this.get('/me');
  }

  async verifySecurityClearance(userId: string): Promise<boolean> {
    return this.post('/verify-clearance', { userId });
  }
}

/**
 * Defense-specific property service
 */
export class DefensePropertyService extends BasePropertyService {
  constructor() {
    super('/api/defense/property');
  }

  async getSecurityClassification(propertyId: string): Promise<string> {
    return this.get(`/${propertyId}/classification`);
  }

  async updateSecurityClassification(propertyId: string, classification: string): Promise<void> {
    return this.put(`/${propertyId}/classification`, { classification });
  }
}

// Export service instances
export const defenseAuthService = new DefenseAuthService();
export const defensePropertyService = new DefensePropertyService();
