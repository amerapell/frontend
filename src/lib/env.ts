const CONFIGURED_API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
export const API_URL = CONFIGURED_API_URL || "http://localhost:4000";
/** Server-side (RSC, route handlers, build): call the API directly. */
export const API_BASE = `${API_URL}/api/v1`;
/**
 * Browser: same-origin `/api/v1`, proxied to the API by the rewrite in next.config.ts, so the httpOnly
 * refresh cookie `ap_rt` is first-party (Safari ITP / Instagram / TikTok webviews drop third-party cookies).
 * Without NEXT_PUBLIC_API_URL there is no rewrite, so fall back to calling the default API URL directly.
 */
export const BROWSER_API_BASE = CONFIGURED_API_URL ? "/api/v1" : API_BASE;
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";
export const IS_DEV = process.env.NODE_ENV !== "production";
export const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
export const WHATSAPP_FALLBACK = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
