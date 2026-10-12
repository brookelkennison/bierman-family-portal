"use client";

import { useSearchParams } from "next/navigation";
import { Banner } from "@/components/ui/Banner";

/** Shown when the proxy sent someone here because their session ran out. */
export function ExpiredNotice() {
  const params = useSearchParams();
  if (params.get("reason") !== "expired") return null;
  return (
    <Banner tone="warning" title="Your session ended">
      Log in again to keep going.
    </Banner>
  );
}
