import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface LocationState {
  from?: string;
}

export function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Simple controlled inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Optional: allow redirect back to where the user came from
  const state = location.state as LocationState | null;
  const redirectTo = state?.from ?? '/app';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setLocalError('Please enter your email and password.');
      return;
    }

    try {
      await login({ email: trimmedEmail, password });
      // If login succeeds, go to /app (or previous page)
      navigate(redirectTo, { replace: true });
    } catch {
      // AuthProvider already set a user-friendly error
      // We don't rethrow or set another message here
    }
  }

  return (
    <section className="auth-page">
      <h1 className="auth-page__title">Log in</h1>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-form__field">
          <label htmlFor="email" className="auth-form__label">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="auth-form__input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="auth-form__field">
          <label htmlFor="password" className="auth-form__label">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="auth-form__input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        {/* Local validation error (empty fields, etc.) */}
        {localError && (
          <p className="auth-form__error">{localError}</p>
        )}

        {/* Server / auth error from AuthProvider */}
        {error && !localError && (
          <p className="auth-form__error">{error}</p>
        )}

        <button
          type="submit"
          className="auth-form__submit"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="auth-page__footer">
        Don&apos;t have an account?{' '}
        <Link to="/signup">Sign up</Link>
      </p>
    </section>
  );
}
