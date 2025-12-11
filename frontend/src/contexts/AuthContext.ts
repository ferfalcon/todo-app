import { createContext } from 'react';
import type { User } from '../types/user';
import type { AuthCredentials } from '../api/auth';

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signup: (credentials: AuthCredentials) => Promise<void>;
  login: (credentials: AuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
