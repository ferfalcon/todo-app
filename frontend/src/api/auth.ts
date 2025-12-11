import { apiFetch } from './client';
import type { User } from '../types/user';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthSuccessPayload {
  user: User;
  token: string;
}

function toUser(raw: unknown): User {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Unexpected user payload from API');
  }

  const data = raw as Record<string, unknown>;

  // Case 1: backend returns { id, email }
  const id = data.id;
  const email = data.email;

  if (typeof id === 'string' && typeof email === 'string') {
    return {
      id,
      email,
    };
  }

  // Case 2: backend returns { user: { id, email } }
  const nestedUser = (data['user'] ?? null) as unknown;

  if (nestedUser && typeof nestedUser === 'object') {
    const userData = nestedUser as Record<string, unknown>;
    const nestedId = userData.id;
    const nestedEmail = userData.email;

    if (typeof nestedId === 'string' && typeof nestedEmail === 'string') {
      return {
        id: nestedId,
        email: nestedEmail,
      };
    }
  }

  // Fallback: log for debugging
  // (helps if backend shape ever drifts)
  // eslint-disable-next-line no-console
  console.error('Unexpected user payload from API:', raw);
  throw new Error('Unexpected user payload from API');
}

function toAuthSuccess(raw: unknown): AuthSuccessPayload {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid auth response from API');
  }

  const data = raw as Record<string, unknown>;

  const tokenValue = data['token'];

  if (typeof tokenValue !== 'string') {
    throw new Error('Missing token in auth response');
  }

  // user may be nested under "user" or be the top-level object
  const userSource =
    'user' in data && data['user'] != null
      ? (data['user'] as unknown)
      : raw;

  const user = toUser(userSource);

  return {
    user,
    token: tokenValue,
  };
}

export async function signup(
  credentials: AuthCredentials,
): Promise<AuthSuccessPayload> {
  const raw = await apiFetch<unknown>('/auth/signup', {
    method: 'POST',
    json: credentials,
  });
  return toAuthSuccess(raw);
}

export async function login(
  credentials: AuthCredentials,
): Promise<AuthSuccessPayload> {
  const raw = await apiFetch<unknown>('/auth/login', {
    method: 'POST',
    json: credentials,
  });
  return toAuthSuccess(raw);
}

export async function logout(): Promise<void> {
  // You might still have a `/auth/logout` to invalidate tokens server-side.
  await apiFetch<void>('/auth/logout', {
    method: 'POST',
  });
}

export async function getCurrentUser(): Promise<User> {
  const raw = await apiFetch<unknown>('/me', {
    method: 'GET',
  });
  return toUser(raw);
}
