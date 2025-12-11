import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function SignupPage() {
  const { signup, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password || !confirm) {
      setLocalError('Please fill in all fields.');
      return;
    }

    if (password !== confirm) {
      setLocalError('Passwords do not match.');
      return;
    }

    try {
      await signup({ email: trimmedEmail, password });
      // On successful signup, go straight to /app
      navigate('/app', { replace: true });
    } catch {
      // AuthProvider already set an error message
    }
  }

  return (
    <section className="auth-page">
      <h1 className="auth-page__title">Sign up</h1>

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
            autoComplete="new-password"
            className="auth-form__input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="auth-form__field">
          <label htmlFor="confirm" className="auth-form__label">
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            className="auth-form__input"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        {localError && (
          <p className="auth-form__error">{localError}</p>
        )}

        {error && !localError && (
          <p className="auth-form__error">{error}</p>
        )}

        <button
          type="submit"
          className="auth-form__submit"
          disabled={isLoading}
        >
          {isLoading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>

      <p className="auth-page__footer">
        Already have an account?{' '}
        <Link to="/login">Log in</Link>
      </p>
    </section>
  );
}
