export interface User {
  id: string;
  role: string;
  name: string;
  rank: string;
  classification: string;
  permissions: string[];
}

// Mock user for development
const mockUser: User = {
  id: '1',
  role: 'OFFICER',
  name: 'John Doe',
  rank: 'Captain',
  classification: 'SECRET',
  permissions: ['READ', 'WRITE', 'ADMIN']
};

class AuthService {
  async login(credentials: { username: string; password: string }) {
    // In development, always return success with mock data
    if (process.env.NODE_ENV === 'development') {
      return {
        user: mockUser,
        token: 'mock-jwt-token'
      };
    }

    // In production, this would make an actual API call
    throw new Error('Not implemented');
  }

  async logout() {
    // Clear any stored tokens/state
    localStorage.removeItem('token');
    localStorage.removeItem('appState');
  }

  async getCurrentUser(): Promise<User> {
    // In development, return mock user
    if (process.env.NODE_ENV === 'development') {
      return mockUser;
    }

    // In production, this would validate the token and get user data
    throw new Error('Not implemented');
  }

  isAuthenticated(): boolean {
    // In development, always return true
    if (process.env.NODE_ENV === 'development') {
      return true;
    }

    // In production, this would check for a valid token
    const token = localStorage.getItem('token');
    return !!token;
  }
}

export const authService = new AuthService();
