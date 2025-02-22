// Auth state interface
export interface AuthState {
  token: string | null;
  user: {
    id: string;
    email: string;
    roles: string[];
    permissions: string[];
  } | null;
  loading: boolean;
  error: string | null;
}

// Auth credentials interface
export interface AuthCredentials {
  email: string;
  password: string;
}

// Auth response interface
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    roles: string[];
    permissions: string[];
  };
}

// Update BaseState to include auth
declare module '../../createStore' {
  interface BaseState {
    auth: AuthState;
  }
}
