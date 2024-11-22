export interface User {
  id: string;
  militaryId: string;
  rank: string;
  name: string;
  clearanceLevel: string;
}

export type UserRole = 'Admin' | 'Command' | 'Unit' | 'Individual';

export interface AuthState {
  isAuthenticated: boolean;
  classificationLevel: string;
  role: UserRole;
  unitId: string;
  userId: string;
  user: User | null;
} 