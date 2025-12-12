import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface RedirectIfAuthenticatedProps {
  children: ReactNode;
}

interface LocationState {
  from?: string;
}

export function RedirectIfAuthenticated({
  children,
}: RedirectIfAuthenticatedProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const state = location.state as LocationState | null;

  // While loading, just show the page (form) so UI doesn't flicker
  if (isLoading) {
    return <>{children}</>;
  }

  if (user) {
    // If we came from a protected route, go back there; else /app
    const redirectTo = state?.from ?? '/app';
    return <Navigate to={redirectTo} replace />;
  }

  // Not logged in → show the auth page normally
  return <>{children}</>;
}
