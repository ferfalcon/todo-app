const TOKEN_KEY = 'auth_token';

let inMemoryToken: string | null = null;

function isBrowser() {
  return typeof window !== 'undefined';
}

export function setAuthToken(token: string | null): void {
  inMemoryToken = token;

  if (!isBrowser()) return;

  try {
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage errors (private mode, etc.)
  }
}

export function getAuthToken(): string | null {
  if (inMemoryToken) {
    return inMemoryToken;
  }

  if (!isBrowser()) {
    return null;
  }

  try {
    const token = window.localStorage.getItem(TOKEN_KEY);
    inMemoryToken = token;
    return token;
  } catch {
    return inMemoryToken;
  }
}

export function clearAuthToken(): void {
  setAuthToken(null);
}
