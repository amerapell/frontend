import { api } from "./client";
import type { Exchange, ExchangeRequest } from "../types";

export const exchangesApi = {
  mine: () => api.get<Exchange[]>("me/exchanges", { auth: "customer" }),
  create: (body: ExchangeRequest) => api.post<Exchange>("exchanges", body, { auth: "customer" }),
  uploadPhoto: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post<{ url: string }>("uploads/exchange-photo", fd, { auth: "customer" });
  },
};
