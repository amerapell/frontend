"use client";
import { use } from "react";
import { OrderAdminDetail } from "@/components/admin/Orders";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <OrderAdminDetail id={id} />;
}
