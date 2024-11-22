import { SecurityClassification } from '@/types/shared';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    classification: SecurityClassification;
    permissions: string[];
  };
}

export const authService = {
  async login(credentials: { username: string; password: string }): Promise<AuthResponse> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      throw new Error('Authentication failed');
    }
    
    return response.json();
  },

  setAuthHeader(token: string) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }
}; 