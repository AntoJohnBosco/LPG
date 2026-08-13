/**
 * Placeholder API client.
 *
 * Every request funnels through this module so a real backend (REST, MQTT
 * bridge, or Lovable Cloud) can be wired in later by replacing the
 * `request` implementation — no page or hook changes required.
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 500,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Simulated latency so loading states are exercised during development. */
export function delay<T>(data: T, ms = 420): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

/**
 * Real network call helper — unused while mock data is in place, kept so the
 * swap to a live backend is a one-line change inside each service method.
 */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });

  if (!response.ok) {
    throw new ApiError(`Request to ${path} failed`, response.status);
  }

  return (await response.json()) as T;
}
