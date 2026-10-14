import { api } from "./client";
import type { CheckoutQuote, CheckoutRequest, CheckoutResponse, Order, ZoneCode } from "../types";

const o = { cart: true, auth: "customer" as const };

export const checkoutApi = {
  quote: (zoneCode: ZoneCode, useCredit: boolean) => api.post<CheckoutQuote>("checkout/quote", { zoneCode, useCredit }, o),
  create: (body: CheckoutRequest) => api.post<CheckoutResponse>("checkout", body, o),
  verify: (reference: string) => api.get<{ order: Order }>("checkout/verify", { query: { reference }, auth: "customer" }),
};
