import { apiConfig } from "../config/apiConfig";
import { apiRequest, clearAuthTokens, getApiUrl, getRefreshToken, refreshAccessToken, storeAuthTokens } from "./api";

function normalizeSession(payload) {
  const source = payload?.session || payload?.user || payload?.data?.session || payload?.data?.user || payload?.data || payload;
  if (!source || !source.email) {
    return null;
  }

  return {
    id: source.id || source.userId || "",
    email: source.email,
    name: source.name || source.fullName || source.email,
    avatarUrl: source.avatarUrl || source.avatar_url || "",
    organizations: Array.isArray(source.organizations) ? source.organizations : []
  };
}

function normalizeAuthResult(payload) {
  return {
    accessToken: payload?.accessToken || "",
    refreshToken: payload?.refreshToken || "",
    session: normalizeSession(payload)
  };
}

function buildErrorMessage(error, fallbackMessage) {
  if (error?.status === 404) {
    return "User not found. Please register first.";
  }

  if (error?.status === 409) {
    return "This email is already registered.";
  }

  if (error?.status === 403) {
    return "Access denied for this account.";
  }

  if (error?.status === 400) {
    return error?.message || fallbackMessage;
  }

  return error?.message || fallbackMessage;
}

export async function getCurrentSession() {
  const payload = await apiRequest(apiConfig.AuthController.me.endpoint, {
    method: apiConfig.AuthController.me.method
  });

  return normalizeSession(payload);
}

export async function registerWithEmail({ email, name, password }) {
  try {
    const payload = await apiRequest(apiConfig.AuthController.register.endpoint, {
      method: apiConfig.AuthController.register.method,
      body: JSON.stringify({ email, name, password })
    }, false);

    const result = normalizeAuthResult(payload);
    if (result.accessToken || result.refreshToken) {
      storeAuthTokens(result);
    }

    const session = await getCurrentSession();
    return {
      ok: true,
      session
    };
  } catch (error) {
    return {
      ok: false,
      status: error?.status,
      message: buildErrorMessage(error, "Registration failed.")
    };
  }
}

export async function signInWithEmail({ email, password }) {
  try {
    const payload = await apiRequest(apiConfig.AuthController.login.endpoint, {
      method: apiConfig.AuthController.login.method,
      body: JSON.stringify({ email, password })
    }, false);

    const result = normalizeAuthResult(payload);
    if (result.accessToken || result.refreshToken) {
      storeAuthTokens(result);
    }

    const session = await getCurrentSession();
    return {
      ok: true,
      session
    };
  } catch (error) {
    return {
      ok: false,
      status: error?.status,
      message: buildErrorMessage(error, "Sign-in failed.")
    };
  }
}

export async function hydrateOAuthSessionFromQuery(search) {
  const params = new URLSearchParams(search);
  const accessToken = params.get("accessToken") || "";
  const refreshToken = params.get("refreshToken") || "";

  if (!accessToken || !refreshToken) {
    return {
      ok: false,
      message: "OAuth callback is missing required tokens."
    };
  }

  try {
    storeAuthTokens({ accessToken, refreshToken });
    const session = await getCurrentSession();
    return {
      ok: true,
      session
    };
  } catch (error) {
    clearAuthTokens();
    return {
      ok: false,
      status: error?.status,
      message: buildErrorMessage(error, "OAuth session could not be created.")
    };
  }
}

export function startProviderSignIn(provider) {
  if (typeof window === "undefined") {
    return {
      ok: false,
      code: "browser_required"
    };
  }

  const providerEndpoint = provider === "google"
    ? apiConfig.AuthController.googleStart.endpoint
    : apiConfig.AuthController.githubStart.endpoint;

  const returnUrl = `${window.location.origin}/auth/callback`;
  const url = `${getApiUrl(providerEndpoint)}?returnUrl=${encodeURIComponent(returnUrl)}`;
  window.location.href = url;

  return { ok: true };
}

export async function tryRestoreSession() {
  try {
    const session = await getCurrentSession();
    return { ok: true, session };
  } catch (error) {
    if ((error?.status === 401 || error?.status === 404) && getRefreshToken()) {
      try {
        await refreshAccessToken();
        const session = await getCurrentSession();
        return { ok: true, session };
      } catch {
        clearAuthTokens();
      }
    }

    clearAuthTokens();
    return {
      ok: false,
      status: error?.status,
      message: buildErrorMessage(error, "Session could not be restored.")
    };
  }
}

export async function signOut() {
  const refreshToken = getRefreshToken();

  try {
    if (refreshToken) {
      await apiRequest(apiConfig.AuthController.logout.endpoint, {
        method: apiConfig.AuthController.logout.method,
        body: JSON.stringify({ refreshToken })
      }, false);
    }
  } finally {
    clearAuthTokens();
  }
}
