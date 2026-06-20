"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
  useCallback,
} from "react";
import {
  Product,
  Feature,
  EvolutionEvent,
  ProductBundle,
} from "./types";
import { SEED_BUNDLES } from "./seed";
import { track } from "./novus";
import { hasSupabase } from "./env";
import * as remote from "./remote";

// FeatureDNA store: instant, persistent, demo-safe.
// Seeds from famous products; persists user changes to localStorage.
// (Supabase sync can be layered on top via the same surface area.)

const STORAGE_KEY = "featuredna:v1";

interface DBState {
  products: Product[];
  features: Feature[];
  events: EvolutionEvent[];
}

function seedState(): DBState {
  return {
    products: SEED_BUNDLES.map((b) => ({ ...b.product })),
    features: SEED_BUNDLES.flatMap((b) => b.features.map((f) => ({ ...f }))),
    events: SEED_BUNDLES.flatMap((b) => b.events.map((e) => ({ ...e }))),
  };
}

function loadState(): DBState {
  if (typeof window === "undefined") return seedState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as DBState;
    // Always re-merge seed products so museum stays intact even if schema grows.
    const seeded = seedState();
    const userProducts = parsed.products.filter((p) => !p.seeded);
    const userProductIds = new Set(userProducts.map((p) => p.id));
    return {
      products: [...seeded.products, ...userProducts],
      features: [
        ...seeded.features,
        ...parsed.features.filter((f) => userProductIds.has(f.productId)),
      ],
      events: mergeEvents(
        seeded.events,
        { events: parsed.events, features: parsed.features },
        userProductIds,
        seeded
      ),
    };
  } catch {
    return seedState();
  }
}

// Keep seed events but allow user-added events on BOTH seed features and
// user-created features. We build a complete feature->product map from seed
// + saved features so no user event is dropped on reload.
function mergeEvents(
  seedEvents: EvolutionEvent[],
  saved: { events: EvolutionEvent[]; features: Feature[] },
  userProductIds: Set<string>,
  seeded: DBState
): EvolutionEvent[] {
  const seedIds = new Set(seedEvents.map((e) => e.id));
  const seedFeatureIds = new Set(seeded.features.map((f) => f.id));
  const featureToProduct = new Map<string, string>();
  [...seeded.features, ...saved.features].forEach((f) =>
    featureToProduct.set(f.id, f.productId)
  );

  const extra = saved.events.filter((e) => {
    if (seedIds.has(e.id)) return false; // already in seed
    const productId = featureToProduct.get(e.featureId);
    // keep if it belongs to a user product, or is an extra event on a seed feature
    return (productId && userProductIds.has(productId)) || seedFeatureIds.has(e.featureId);
  });
  return [...seedEvents, ...extra];
}

interface StoreContextValue {
  products: Product[];
  getBundle: (slugOrId: string) => ProductBundle | null;
  createProduct: (p: Omit<Product, "id" | "slug">) => Product;
  togglePublic: (productId: string) => void;
  addFeature: (f: Omit<Feature, "id">) => Feature;
  addEvent: (ev: Omit<EvolutionEvent, "id">) => EvolutionEvent;
  reorderEvents: (featureId: string, orderedIds: string[]) => void;
  ready: boolean;
}

const StoreContext = createContext<StoreContextValue | null>(null);

let idCounter = 0;
function uid(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DBState>(seedState);
  const [ready, setReady] = useState(false);
  // Whether the live data is backed by Supabase. When false we use localStorage.
  const usingRemote = hasSupabase();

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      if (usingRemote) {
        try {
          // Seed via the server route (reliable, idempotent, works on cold start).
          await fetch("/api/seed", { method: "POST" }).catch(() => {});
          const data = await remote.fetchAll();
          if (data && !cancelled) {
            setState(data);
            setReady(true);
            return;
          }
        } catch (err) {
          // Supabase failed — fall back to localStorage so the demo never breaks.
          // eslint-disable-next-line no-console
          console.warn("[sompl] Supabase load failed, using local store:", err);
        }
      }
      if (!cancelled) {
        setState(loadState());
        setReady(true);
      }
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, [usingRemote]);

  // Persist to localStorage only when NOT using Supabase (remote is source of truth).
  useEffect(() => {
    if (!ready || usingRemote) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota */
    }
  }, [state, ready, usingRemote]);

  const getBundle = useCallback(
    (slugOrId: string): ProductBundle | null => {
      const product = state.products.find(
        (p) => p.slug === slugOrId || p.id === slugOrId
      );
      if (!product) return null;
      const features = state.features.filter((f) => f.productId === product.id);
      const featureIds = new Set(features.map((f) => f.id));
      const events = state.events
        .filter((e) => featureIds.has(e.featureId))
        .sort((a, b) => +new Date(a.date) - +new Date(b.date));
      return { product, features, events };
    },
    [state]
  );

  const createProduct = useCallback(
    (p: Omit<Product, "id" | "slug">) => {
      const tempId = uid("prod");
      const product: Product = {
        ...p,
        id: tempId,
        slug: `${slugify(p.name)}-${tempId.slice(-4)}`,
      };
      setState((s) => ({ ...s, products: [product, ...s.products] }));
      track("product_created", { name: p.name, category: p.category });

      if (usingRemote) {
        remote
          .currentUserId()
          .then((ownerId) =>
            remote.insertProduct({ ...product, seeded: false, ownerId })
          )
          .then((saved) => {
            if (!saved) return;
            // reconcile temp id -> real db id (slug stays the same)
            setState((s) => ({
              ...s,
              products: s.products.map((x) => (x.id === tempId ? saved : x)),
              features: s.features.map((f) =>
                f.productId === tempId ? { ...f, productId: saved.id } : f
              ),
            }));
          })
          .catch((e) => console.warn("[sompl] insertProduct failed:", e));
      }
      return product;
    },
    [usingRemote]
  );

  const togglePublic = useCallback(
    (productId: string) => {
      let nextVal = false;
      setState((s) => ({
        ...s,
        products: s.products.map((p) => {
          if (p.id !== productId) return p;
          nextVal = !p.isPublic;
          return { ...p, isPublic: nextVal };
        }),
      }));
      track("product_publish_toggled", { productId });
      if (usingRemote) {
        remote
          .updateProductPublic(productId, nextVal)
          .catch((e) => console.warn("[sompl] updateProductPublic failed:", e));
      }
    },
    [usingRemote]
  );

  const addFeature = useCallback(
    (f: Omit<Feature, "id">) => {
      const tempId = uid("feat");
      const feature: Feature = { ...f, id: tempId };
      setState((s) => ({ ...s, features: [...s.features, feature] }));
      track("feature_created", { name: f.name, productId: f.productId });
      if (usingRemote) {
        remote
          .insertFeature(f)
          .then((saved) => {
            if (!saved) return;
            setState((s) => ({
              ...s,
              features: s.features.map((x) => (x.id === tempId ? saved : x)),
              events: s.events.map((e) =>
                e.featureId === tempId ? { ...e, featureId: saved.id } : e
              ),
            }));
          })
          .catch((e) => console.warn("[sompl] insertFeature failed:", e));
      }
      return feature;
    },
    [usingRemote]
  );

  const addEvent = useCallback(
    (ev: Omit<EvolutionEvent, "id">) => {
      const tempId = uid("evt");
      const event: EvolutionEvent = { ...ev, id: tempId };
      setState((s) => ({ ...s, events: [...s.events, event] }));
      track("event_added", { type: ev.type, source: ev.source, featureId: ev.featureId });
      if (usingRemote) {
        remote
          .insertEvent(ev)
          .then((saved) => {
            if (!saved) return;
            setState((s) => ({
              ...s,
              events: s.events.map((x) => (x.id === tempId ? saved : x)),
            }));
          })
          .catch((e) => console.warn("[sompl] insertEvent failed:", e));
      }
      return event;
    },
    [usingRemote]
  );

  const reorderEvents = useCallback(
    (featureId: string, orderedIds: string[]) => {
      setState((s) => {
        const order = new Map(orderedIds.map((id, i) => [id, i]));
        // We persist order by nudging dates minimally only within the feature.
        const featureEvents = s.events
          .filter((e) => e.featureId === featureId)
          .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
        // reassign monotonically increasing dates preserving day spacing
        const base = featureEvents.map((e) => +new Date(e.date)).sort((a, b) => a - b);
        const remap = new Map<string, string>();
        featureEvents.forEach((e, i) => {
          remap.set(e.id, new Date(base[i]).toISOString().slice(0, 10));
        });
        return {
          ...s,
          events: s.events.map((e) =>
            remap.has(e.id) ? { ...e, date: remap.get(e.id)! } : e
          ),
        };
      });
      track("timeline_reordered", { featureId });
    },
    []
  );

  const value = useMemo(
    () => ({
      products: state.products,
      getBundle,
      createProduct,
      togglePublic,
      addFeature,
      addEvent,
      reorderEvents,
      ready,
    }),
    [state.products, getBundle, createProduct, togglePublic, addFeature, addEvent, reorderEvents, ready, usingRemote]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
