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
import {
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from '../auth/tokenStorage';

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

  // On mount: if we have a token, try to load the current user.
  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUserWithToken() {
      const token = getAuthToken();

      // No token → definitely not logged in.
      if (!token) {
        if (isMounted) {
          setUser(null);
          setError(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const me = await getCurrentUser();
        if (!isMounted) return;
        setUser(me);
        setError(null);
      } catch (err) {
        if (!isMounted) return;

        if (err instanceof ApiError && err.status === 401) {
          // Token invalid/expired → clear it out.
          clearAuthToken();
          setUser(null);
          setError(null);
        } else {
          setError('Unable to load current user.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCurrentUserWithToken();

    return () => {
      isMounted = false;
    };
  }, []);

  const signup = useCallback(
    async (credentials: AuthCredentials) => {
      setIsLoading(true);
      setError(null);
      try {
        const { user: createdUser, token } = await signupApi(credentials);
        setAuthToken(token);
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
        const { user: loggedInUser, token } = await loginApi(credentials);
        setAuthToken(token);
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
    } catch (err) {
      // Even if backend logout fails, clear token locally.
      handleAuthError(err);
    } finally {
      clearAuthToken();
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const me = await getCurrentUser();
      setUser(me);
    } catch (err) {
      handleAuthError(err);
      clearAuthToken();
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
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
