import { apiFetch } from './client';
import type { User } from '../types/user';

export interface AuthCredentials {
  email: string;
  password: string;
}

/**
 * POST /auth/signup
 * Creates a new user and establishes a session (cookie).
 */
export async function signup(
  credentials: AuthCredentials,
): Promise<User> {
  return apiFetch<User>('/auth/signup', {
    method: 'POST',
    json: credentials,
  });
}

/**
 * POST /auth/login
 * Logs in an existing user and establishes a session (cookie).
 */
export async function login(
  credentials: AuthCredentials,
): Promise<User> {
  return apiFetch<User>('/auth/login', {
    method: 'POST',
    json: credentials,
  });
}

/**
 * POST /auth/logout
 * Logs out the current user by clearing the session.
 * Backend spec: can respond with 204 No Content or 200.
 */
export async function logout(): Promise<void> {
  await apiFetch<void>('/auth/logout', {
    method: 'POST',
  });
}

/**
 * GET /me
 * Returns the current authenticated user (if any).
 */
export async function getCurrentUser(): Promise<User> {
  return apiFetch<User>('/me', {
    method: 'GET',
  });
}
