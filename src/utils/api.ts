import { readConfig } from './config.js';

export const API_BASE_URL = process.env.DLBR_API_URL || 'https://api.dlbr.cloud';

export interface APIError {
  success: false;
  error: string;
  message?: string;
  status?: number;
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const config = await readConfig();

  if (!config.token) {
    throw new Error('Not authenticated. Please run `dlbr login --token <your_token>` first.');
  }

  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${config.token}`);
  headers.set('X-DLBR-Token', config.token);

  if (config.workspaceId) {
    headers.set('X-Workspace-ID', config.workspaceId);
  }

  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');

  if (!response.ok) {
    let errorMsg = `HTTP Error: ${response.status} ${response.statusText}`;
    if (isJson) {
      try {
        const errorData = await response.json() as { error?: string; message?: string };
        errorMsg = errorData.message || errorData.error || errorMsg;
      } catch {
        // ignore JSON parse error on error responses
      }
    }
    const err = new Error(errorMsg) as Error & APIError;
    err.success = false;
    err.status = response.status;
    err.error = errorMsg;
    throw err;
  }

  if (isJson) {
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
}
