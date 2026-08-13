import { normalizeApiBase } from './api-url';

let accessToken: string | null = null;
let refreshPromise: Promise<boolean> | null = null;

export const setAccessToken = (token: string | null) => { accessToken = token; };

const apiBase = normalizeApiBase(import.meta.env.VITE_API_URL);

const refresh = async () => {
  if (!refreshPromise) {
    refreshPromise = fetch(`${apiBase}/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) return false;
        const data = await response.json() as { accessToken: string };
        accessToken = data.accessToken;
        return true;
      }).finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
};

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) { super(message); }
}

export async function api<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  let response: Response;
  try {
    response = await fetch(`${apiBase}${path}`, { ...options, headers, credentials: 'include' });
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor. Aguarde um instante e tente novamente.', 0, 'NETWORK_ERROR');
  }
  if (response.status === 401 && retry && await refresh()) return api<T>(path, options, false);
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as {
      error?: string;
      code?: string;
      fields?: { fieldErrors?: Record<string, string[] | undefined>; formErrors?: string[] };
    };
    const fieldMessage = body.fields?.fieldErrors
      ? Object.values(body.fields.fieldErrors).flatMap((messages) => messages ?? [])[0]
      : undefined;
    const formMessage = body.fields?.formErrors?.[0];
    throw new ApiError(fieldMessage || formMessage || body.error || 'Não foi possível concluir a solicitação.', response.status, body.code);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
