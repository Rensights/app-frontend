"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function GlobalLoading() {
  return <LoadingSpinner fullPage={true} message="Loading..." />;
}
