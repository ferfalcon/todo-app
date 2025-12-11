import { useAuth } from '../hooks/useAuth';

export function AuthStatus() {
  const { user, isLoading, error } = useAuth();

  if (isLoading) {
    return <p>Checking session...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Auth error: {error}</p>;
  }

  if (!user) {
    return <p>Not logged in</p>;
  }

  return <p>Logged in as: {user.email}</p>;
}
