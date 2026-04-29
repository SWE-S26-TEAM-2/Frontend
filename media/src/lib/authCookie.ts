export const AUTH_COOKIE_NAME = "sc_auth_token";

const ONE_DAY = 60 * 60 * 24;

export const setAuthCookie = (token: string) => {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${ONE_DAY}; SameSite=Lax${secure}`;
};

export const clearAuthCookie = () => {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
};
