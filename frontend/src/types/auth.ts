export type Role = 'officer' | 'nco' | 'soldier';

export interface User {
  id: string;
  name: string;
  rank: string;
  unit: string;
  role: Role;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
} 