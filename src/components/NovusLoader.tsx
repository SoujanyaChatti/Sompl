"use client";

import { useEffect, useRef } from "react";
import { trackPage } from "@/lib/novus";
import { usePathname } from "next/navigation";

export function NovusLoader() {
  const pathname = usePathname();
  const pendoInitialized = useRef(false);

  useEffect(() => {
    if (!pendoInitialized.current && typeof pendo !== "undefined") {
      pendo.initialize({
        visitor: {
          id: ''
        }
      });
      pendoInitialized.current = true;
    }
  }, []);

  useEffect(() => {
    trackPage(pathname || "/");
  }, [pathname]);

  return null;
}
