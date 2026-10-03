const BASE_URL = "/api/v1";

export class ApiRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type RequestBody = Record<string, unknown> | FormData;

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: RequestBody;
  query?: Record<string, string | number | undefined>;
}

// Share one refresh between requests that fail with 401 at the same time.
let refreshInFlight: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  refreshInFlight ??= fetch(`${BASE_URL}/users/refresh-token`, {
    method: "POST",
    credentials: "include",
  })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

const NO_REFRESH_PATHS = ["/users/login", "/users/register", "/users/refresh-token"];

/**
 * Calls the backend and returns the `data` field of its ApiResponse.
 * On a 401 it refreshes the access token once and retries.
 */
export async function api<T>(path: string, options: RequestOptions = {}, retry = true): Promise<T> {
  const { method = "GET", body, query } = options;

  const url = new URL(BASE_URL + path, window.location.origin);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }

  const init: RequestInit = { method, credentials: "include" };
  if (body instanceof FormData) {
    init.body = body;
  } else if (body) {
    init.body = JSON.stringify(body);
    init.headers = { "Content-Type": "application/json" };
  }

  const res = await fetch(url, init);

  if (res.status === 401 && retry && !NO_REFRESH_PATHS.includes(path)) {
    if (await refreshSession()) return api<T>(path, options, false);
  }

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      typeof json?.message === "string" && json.message
        ? json.message
        : `Request failed (${res.status})`;
    throw new ApiRequestError(res.status, message);
  }

  return json?.data as T;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}
