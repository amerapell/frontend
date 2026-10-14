import { api } from "./client";
import type { Address, CreditLedger, Order, ProductCard, User } from "../types";

const o = { auth: "customer" as const };

export const accountApi = {
  me: () => api.get<User>("me", o),
  updateMe: (b: { firstName?: string; lastName?: string; phone?: string | null; marketingConsent?: boolean }) => api.patch<User>("me", b, o),
  orders: () => api.get<Order[]>("me/orders", o),
  order: (number: string) => api.get<Order>(`me/orders/${encodeURIComponent(number)}`, o),
  addresses: () => api.get<Address[]>("me/addresses", o),
  addAddress: (a: Address) => api.post<Address>("me/addresses", a, o),
  updateAddress: (id: string, a: Partial<Address>) => api.patch<Address>(`me/addresses/${id}`, a, o),
  deleteAddress: (id: string) => api.del<Address[]>(`me/addresses/${id}`, o),
  wishlist: () => api.get<ProductCard[]>("me/wishlist", o),
  addWish: (productId: string) => api.post<ProductCard[]>(`me/wishlist/${productId}`, undefined, o),
  removeWish: (productId: string) => api.del<ProductCard[]>(`me/wishlist/${productId}`, o),
  credit: () => api.get<CreditLedger>("me/credit", o),
  dataExport: () => api.get<unknown>("me/data-export", o),
  deleteAccount: () => api.del<{ ok: true }>("me", o),
  lookupOrder: (number: string, email: string) => api.post<Order>("orders/lookup", { number, email }),
};
