import supabase from "./supabaseClient.js";
import { resolveBaseUrl } from "./apiBaseUrl.js";

const TIMEOUT_MS = 30000;
const BASE_URL = resolveBaseUrl(import.meta.env.VITE_API_BASE_URL);
const GET_CACHE_TTL_MS = 15000;

let cachedAuthHeaderPromise = null;
const getCache = new Map();
const inFlightGetRequests = new Map();

/** Error thrown by the http client for any non-2xx response or network failure. */
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function getAuthHeader() {
  if (cachedAuthHeaderPromise) {
    return cachedAuthHeaderPromise;
  }

  cachedAuthHeaderPromise = supabase.auth
    .getSession()
    .then(async ({ data }) => {
      const token = data.session?.access_token;
      return token ? { Authorization: `Bearer ${token}` } : {};
    })
    .catch(() => ({}));

  return cachedAuthHeaderPromise;
}

export function resetHttpClientState({ clearGetCache = false } = {}) {
  cachedAuthHeaderPromise = null;
  if (clearGetCache) {
    getCache.clear();
    inFlightGetRequests.clear();
  }
}

function buildUrl(path, params) {
  const normalizedBaseUrl = BASE_URL.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(
    `${normalizedBaseUrl}${normalizedPath}`,
    window.location.origin,
  );
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null)
        url.searchParams.set(key, value);
    });
  }
  return url.toString();
}

async function request(method, path, { params, body } = {}, isRetry = false) {
  const url = buildUrl(path, params);

  if (method === "GET") {
    const cacheKey = `${method}:${url}`;
    const cachedEntry = getCache.get(cacheKey);
    if (cachedEntry && Date.now() < cachedEntry.expiresAt) {
      return cachedEntry.payload;
    }

    const inFlightEntry = inFlightGetRequests.get(cacheKey);
    if (inFlightEntry) {
      return inFlightEntry;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const runRequest = async () => {
    const authHeader = await getAuthHeader();
    let response;
    try {
      response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeader },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        throw new ApiError(504, "Request timed out. Please try again.");
      }
      // Retry idempotent GETs once on a network failure before giving up.
      if (method === "GET" && !isRetry) {
        return request(method, path, { params, body }, true);
      }
      throw new ApiError(0, "Network error. Please check your connection.");
    }
    clearTimeout(timeoutId);

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const message = payload?.error || "Something went wrong.";
      throw new ApiError(payload?.status ?? response.status, message);
    }

    if (method === "GET") {
      const cacheKey = `${method}:${url}`;
      getCache.set(cacheKey, {
        payload,
        expiresAt: Date.now() + GET_CACHE_TTL_MS,
      });
    } else {
      getCache.clear();
    }

    return payload;
  };

  const requestPromise = runRequest();

  if (method === "GET") {
    const cacheKey = `${method}:${url}`;
    inFlightGetRequests.set(cacheKey, requestPromise);
  }

  try {
    return await requestPromise;
  } finally {
    if (method === "GET") {
      const cacheKey = `${method}:${url}`;
      inFlightGetRequests.delete(cacheKey);
    }
  }
}

/** Single HTTP client instance: attaches the Supabase bearer token, 30s timeout, retries GETs once. */
export const http = {
  get: (path, options = {}) => request("GET", path, options),
  prefetch: (path, options = {}) =>
    request("GET", path, options).catch(() => null),
  post: (path, body) => request("POST", path, { body }),
};
