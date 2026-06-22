export const SESSION_KEY = "labelit-auth-session-v1";

export const authorizedMembers = [
  {
    email: "admin@example.com",
    name: "Admin User"
  }
];

export const socialProviders = [
  {
    id: "google",
    label: "Google"
  },
  {
    id: "github",
    label: "GitHub"
  }
];

export function isAuthorizedMember(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  return authorizedMembers.find(member => member.email.toLowerCase() === normalizedEmail) || null;
}
