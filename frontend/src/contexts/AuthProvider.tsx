import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { AuthContext, type AuthContextValue } from './AuthContext';
import {
  getCurrentUser,
  login as loginApi,
  logout as logoutApi,
  signup as signupApi,
  type AuthCredentials,
} from '../api/auth';
import { ApiError } from '../api/client';
import type { User } from '../types/user';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAuthError = (err: unknown) => {
    if (err instanceof ApiError) {
      setError(err.message);
    } else {
      setError('Something went wrong. Please try again.');
    }
  };

  // Load current user on initial mount: calls GET /me
  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      try {
        const me = await getCurrentUser();
        if (isMounted) {
          setUser(me);
          setError(null);
        }
      } catch (err) {
        if (!isMounted) return;

        if (err instanceof ApiError) {
          // 401 means "not logged in" → not a user-facing error
          if (err.status === 401) {
            setUser(null);
            setError(null);
          } else {
            setError(err.message);
          }
        } else {
          setError('Unable to load current user.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const signup = useCallback(
    async (credentials: AuthCredentials) => {
      setIsLoading(true);
      setError(null);
      try {
        const createdUser = await signupApi(credentials);
        setUser(createdUser);
      } catch (err) {
        handleAuthError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const login = useCallback(
    async (credentials: AuthCredentials) => {
      setIsLoading(true);
      setError(null);
      try {
        const loggedInUser = await loginApi(credentials);
        setUser(loggedInUser);
      } catch (err) {
        handleAuthError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await logoutApi();
      setUser(null);
    } catch (err) {
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const me = await getCurrentUser();
      setUser(me);
    } catch (err) {
      handleAuthError(err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    error,
    signup,
    login,
    logout,
    refresh,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
