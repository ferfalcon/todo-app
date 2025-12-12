import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // While we don't know yet (checking token + /me), avoid redirect loops
  if (isLoading) {
    return <p>Checking authentication…</p>;
  }

  // Not logged in → send to /login and remember where they came from
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  // Logged in → render whatever we wrapped (e.g. MainLayout)
  return <>{children}</>;
}
