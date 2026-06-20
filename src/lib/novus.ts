// Novus.ai analytics — MANDATORY for the hackathon.
// Provides a single track() surface used across the app. It forwards events
// to Novus when the SDK is present, and always mirrors to a local event log
// so the "meaningful activity" is demonstrable even offline.

type Props = Record<string, unknown>;

declare global {
  interface Window {
    // Novus is delivered via Pendo's web SDK (novus-by-pendo).
    pendo?: {
      track?: (event: string, props?: Props) => void;
      pageLoad?: (props?: Props) => void;
      initialize?: (opts?: Record<string, unknown>) => void;
    };
    novus?: {
      track?: (event: string, props?: Props) => void;
      page?: (name?: string, props?: Props) => void;
      identify?: (id: string, props?: Props) => void;
    };
    __novusQueue?: Array<{ event: string; props?: Props; ts: number }>;
  }
}

const LOG_KEY = "featuredna:novus-log";

export function track(event: string, props: Props = {}) {
  if (typeof window === "undefined") return;

  // Forward to Novus (Pendo web SDK) — the mandatory analytics layer.
  try {
    window.pendo?.track?.(event, props);
  } catch {
    /* never let analytics break the app */
  }
  // Back-compat: also forward to a window.novus shim if one exists.
  try {
    window.novus?.track?.(event, props);
  } catch {
    /* never let analytics break the app */
  }

  // Always mirror locally (visible in the in-app Activity panel + console).
  const entry = { event, props, ts: Date.now() };
  try {
    const raw = localStorage.getItem(LOG_KEY);
    const log = raw ? (JSON.parse(raw) as typeof entry[]) : [];
    log.push(entry);
    // keep last 200
    localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(-200)));
    window.dispatchEvent(new CustomEvent("novus:track", { detail: entry }));
  } catch {
    /* ignore */
  }

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug("[novus]", event, props);
  }
}

export function trackPage(name: string, props: Props = {}) {
  if (typeof window === "undefined") return;
  // Pendo records page views via pageLoad / track.
  try {
    window.pendo?.pageLoad?.({ page: name, ...props });
  } catch {
    /* ignore */
  }
  try {
    window.novus?.page?.(name, props);
  } catch {
    /* ignore */
  }
  track("page_viewed", { name, ...props });
}

export function readActivityLog() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? (JSON.parse(raw) as Array<{ event: string; props: Props; ts: number }>) : [];
  } catch {
    return [];
  }
}
