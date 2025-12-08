"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import "../dashboard/dashboard.css";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout requireAuth={true}>{children}</AppLayout>;
}

