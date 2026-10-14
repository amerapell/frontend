export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
export const API_BASE = `${API_URL}/api/v1`;
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";
export const IS_DEV = process.env.NODE_ENV !== "production";
export const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
export const WHATSAPP_FALLBACK = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
