import { apiConfig } from "../config/apiConfig";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || apiConfig.baseUrl || "").replace(/\/+$/, "");
const ACCESS_TOKEN_KEY = "labelit_access_token";
const REFRESH_TOKEN_KEY = "labelit_refresh_token";

function joinUrl(path) {
  if (!API_BASE_URL) {
    return path;
  }

  return new URL(path.startsWith("/") ? path : `/${path}`, `${API_BASE_URL}/`).toString().replace(/\/$/, path.endsWith("/") ? "/" : "");
}

export function getApiUrl(path) {
  return joinUrl(path);
}

export function resolveEndpoint(endpoint, params = {}) {
  return Object.entries(params).reduce(
    (resolvedPath, [key, value]) => resolvedPath.replace(`:${key}`, encodeURIComponent(String(value))),
    endpoint
  );
}

export function getAccessToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY) || "";
}

export function getRefreshToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(REFRESH_TOKEN_KEY) || "";
}

export function storeAuthTokens({ accessToken = "", refreshToken = "" }) {
  if (typeof window === "undefined") {
    return;
  }

  if (accessToken) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  } else {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  if (refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function clearAuthTokens() {
  storeAuthTokens({});
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : {};
}

function extractMessage(payload, fallbackMessage) {
  if (!payload) {
    return fallbackMessage;
  }

  if (typeof payload === "string") {
    return payload;
  }

  return payload.message || payload.error || payload.title || fallbackMessage;
}

function storeTokensFromPayload(payload) {
  const accessToken = payload?.accessToken || payload?.token || payload?.data?.accessToken || "";
  const refreshToken = payload?.refreshToken || payload?.data?.refreshToken || "";

  if (accessToken || refreshToken) {
    storeAuthTokens({ accessToken, refreshToken });
  }
}

let refreshPromise = null;

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearAuthTokens();
    throw new Error("No refresh token available.");
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(getApiUrl(apiConfig.AuthController.refresh.endpoint), {
        method: apiConfig.AuthController.refresh.method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ refreshToken })
      });

      const payload = await parseResponse(response);
      if (!response.ok) {
        clearAuthTokens();
        const error = new Error(extractMessage(payload, "Session refresh failed."));
        error.status = response.status;
        throw error;
      }

      storeTokensFromPayload(payload);
      return payload;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiRequest(path, options = {}, retryOnUnauthorized = true) {
  const accessToken = getAccessToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(getApiUrl(path), {
    ...options,
    headers
  });

  const payload = await parseResponse(response);

  if (response.status === 401 && retryOnUnauthorized && getRefreshToken()) {
    try {
      await refreshAccessToken();
      return apiRequest(path, options, false);
    } catch {
      clearAuthTokens();
    }
  }

  if (!response.ok) {
    const error = new Error(extractMessage(payload, "Request failed."));
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  storeTokensFromPayload(payload);
  return payload;
}
