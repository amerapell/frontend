import "server-only";
import { cache } from "react";
import { catalogApi, safe } from "./api";
import type { Collection, StoreSettings } from "./types";

/** Used only if the API can't be reached in production — keeps every page renderable. */
export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Amerapelle",
  pickupAddress: "",
  openingHours: "",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  instagramUrl: "",
  tiktokUrl: "",
  contactEmail: "",
  contactPhone: "",
  paystackEnabled: true,
  bachsEnabled: true,
  exchangeWindowDays: 14,
  creditExpiryDays: null,
  freeDeliveryThresholdKobo: null,
  tickerText: ["DELIVERY ACROSS NIGERIA", "PAY WITH PAYSTACK OR BACHS", "EXCHANGE, NOT REFUND", "LAGOS"],
  drop: null,
};

export const getSettings = cache(() => safe<StoreSettings>(catalogApi.settings(), DEFAULT_SETTINGS));
export const getCollections = cache(() => safe<Collection[]>(catalogApi.collections(), []));
