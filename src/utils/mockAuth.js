import { SESSION_KEY, isAuthorizedMember } from "../constants/auth";

export function getStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed?.email || !isAuthorizedMember(parsed.email)) {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }

    return parsed;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function signInWithEmail(email) {
  const member = isAuthorizedMember(email);
  if (!member) {
    return {
      ok: false,
      code: "unauthorized"
    };
  }

  const session = {
    email: member.email,
    name: member.name,
    signedInAt: new Date().toISOString()
  };

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return {
    ok: true,
    session
  };
}

export function signInWithProvider(provider) {
  return {
    ok: false,
    code: "provider_not_configured",
    provider
  };
}

export function signOut() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SESSION_KEY);
}
