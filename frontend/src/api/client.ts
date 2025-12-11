import { config } from '../config';
import { getAuthToken } from '../auth/tokenStorage';

export interface ApiErrorPayload {
  error?: string;
  message?: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export interface ApiRequestOptions extends RequestInit {
  /**
   * If provided, will be JSON.stringify'ed and sent as the request body.
   * Also sets 'Content-Type: application/json'.
   */
  json?: unknown;
}

/**
 * Low-level helper to call our backend API.
 * - Prefixes URLs with config.apiBaseUrl
 * - Attaches Authorization: Bearer <token> if available
 * - Parses JSON responses
 * - Throws ApiError for non-2xx status codes
 */
export async function apiFetch<TResponse>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const url = `${config.apiBaseUrl}${path}`;

  const headers = new Headers(options.headers);

  // Handle JSON body
  let body = options.body ?? undefined;

  if (options.json !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.json);
  }

  // Attach auth token if we have one and caller didn't override
  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body,
    // no need for credentials: 'include' now
  });

  const rawText = await response.text();
  let data: unknown;

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      // Not JSON - keep as plain text
      data = rawText;
    }
  }

  if (!response.ok) {
    const payload = (data ?? {}) as ApiErrorPayload;

    const messageFromPayload =
      payload.error ??
      payload.message ??
      `Request failed with status ${response.status}`;

    throw new ApiError(messageFromPayload, response.status, data);
  }

  return data as TResponse;
}
