import { api } from "./client";
import type { Cart, Utm } from "../types";

const o = { cart: true, auth: "customer" as const };

export const cartApi = {
  create: (utm?: Utm) => api.post<Cart>("cart", { utm }, o),
  get: () => api.get<Cart>("cart", o),
  addLine: (variantId: string, quantity: number) => api.post<Cart>("cart/lines", { variantId, quantity }, o),
  updateLine: (lineId: string, patch: { quantity?: number; variantId?: string }) => api.patch<Cart>(`cart/lines/${lineId}`, patch, o),
  removeLine: (lineId: string) => api.del<Cart>(`cart/lines/${lineId}`, o),
  applyPromo: (code: string) => api.post<Cart>("cart/promo", { code }, o),
  removePromo: () => api.del<Cart>("cart/promo", o),
  merge: (guestToken: string) => api.post<Cart>("cart/merge", { guestToken }, o),
};
