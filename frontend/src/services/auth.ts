import { User, LoginCredentials, LoginResponse, AppVersion } from '@/types/auth';

class AuthService {
  private tokenKey = 'token';
  private versionKey = 'selectedVersion';

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // In a real app, this would make an API call
    // For now, we'll simulate a successful login with mock data
    const mockUser: User = {
      id: 'dev-user',
      name: 'Test Officer',
      email: credentials.email || 'test@example.com',
      rank: 'CPT',
      role: 'OFFICER',
      classification: 'SECRET',
      permissions: ['read', 'write'],
      unit: 'Test Unit',
      dutyPosition: 'Test Position',
      lastLogin: new Date().toISOString(),
      preferences: {
        theme: 'dark',
        language: 'en',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        notifications: {
          email: true,
          push: true,
          transferRequests: true,
          securityAlerts: true,
          systemUpdates: true,
          assetChanges: true,
        },
      },
    };

    const mockResponse: LoginResponse = {
      user: mockUser,
      token: 'mock-jwt-token',
    };

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return mockResponse;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    // Don't remove version on logout
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getVersion(): AppVersion | null {
    return localStorage.getItem(this.versionKey) as AppVersion | null;
  }

  setVersion(version: AppVersion): void {
    localStorage.setItem(this.versionKey, version);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
