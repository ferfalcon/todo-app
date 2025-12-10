function getApiBaseUrl(): string {
  const envValue = import.meta.env.VITE_API_BASE_URL;

  // Fallback for local dev if env is not set
  const fallback = 'http://localhost:3000';

  const raw = (envValue ?? fallback).trim();

  // Remove any trailing slashes just to normalize
  return raw.replace(/\/+$/, '');
}

export const config = {
  apiBaseUrl: getApiBaseUrl(),
};
