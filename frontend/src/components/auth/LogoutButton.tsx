import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function LogoutButton() {
  const { logout, isLoading } = useAuth();
  const navigate = useNavigate();

  async function handleClick() {
    try {
      await logout();
    } finally {
      // Even if backend logout fails, we cleared the token locally,
      // so send user to login.
      navigate('/login', { replace: true });
    }
  }

  return (
    <button
      type="button"
      className="app-layout__logout-button"
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? 'Logging out…' : 'Log out'}
    </button>
  );
}
