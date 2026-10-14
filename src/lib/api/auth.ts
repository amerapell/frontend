import { api } from "./client";
import type { AuthResponse, User } from "../types";

export const authApi = {
  register: (b: { email: string; password: string; firstName: string; lastName: string; phone?: string; marketingConsent: boolean }) =>
    api.post<AuthResponse>("auth/register", b),
  login: (email: string, password: string) => api.post<AuthResponse>("auth/login", { email, password }),
  refresh: () => api.post<{ accessToken: string }>("auth/refresh"),
  logout: () => api.post<{ ok: true }>("auth/logout"),
  forgot: (email: string) => api.post<{ ok: true }>("auth/forgot-password", { email }),
  reset: (token: string, password: string) => api.post<{ ok: true }>("auth/reset-password", { token, password }),
  verifyEmail: (token: string) => api.post<User>("auth/verify-email", { token }),
  resendVerification: () => api.post<{ ok: true; sent: boolean }>("auth/resend-verification", undefined, { auth: "customer" }),
  /** Google Identity Services ID token → same response as login. */
  google: (credential: string) => api.post<AuthResponse>("auth/google", { credential }),
};
