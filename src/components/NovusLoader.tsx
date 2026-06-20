"use client";

import Script from "next/script";
import { useEffect } from "react";
import { trackPage } from "@/lib/novus";
import { usePathname } from "next/navigation";

// Loads the Novus.ai analytics SDK (mandatory). Reads the project key from
// NEXT_PUBLIC_NOVUS_KEY. If absent, the app still records activity locally
// via the track() mirror so the Activity panel stays meaningful for the demo.

export function NovusLoader() {
  const pathname = usePathname();
  const key = process.env.NEXT_PUBLIC_NOVUS_KEY;

  useEffect(() => {
    trackPage(pathname || "/");
  }, [pathname]);

  if (!key) return null;

  return (
    <Script
      id="novus-analytics"
      strategy="afterInteractive"
      src={`https://cdn.novus.ai/analytics.js?key=${key}`}
      onLoad={() => {
        // eslint-disable-next-line no-console
        console.debug("[novus] SDK loaded");
      }}
    />
  );
}
