export interface User {
  id: string;
  name: string;
  rank?: string;
  role: string;
  classification?: string;
  permissions: string[];
}

export interface LoginProps {
  onLogin: (user: User) => void;
}
